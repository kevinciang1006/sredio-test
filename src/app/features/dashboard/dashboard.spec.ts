import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { convertToParamMap } from '@angular/router';
import { Subject, of } from 'rxjs';
import { describe, it, expect } from 'vitest';
import { DashboardComponent } from './dashboard';
import { DualKpiPanelComponent } from './components/dual-kpi-panel/dual-kpi-panel';
import { SredProjectsEchartsComponent } from './components/sred-projects-echarts/sred-projects-echarts';
import { EmployeeBreakdownEchartsComponent } from './components/employee-breakdown-echarts/employee-breakdown-echarts';
import { EmployeeModalComponent } from '../../shared/components/employee-modal/employee-modal';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { TeamsService } from './services/teams.service';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute } from '@angular/router';

// ── Echarts stubs ─────────────────────────────────────────────────────────────
// Replace the real echarts chart components so jsdom doesn't need a canvas.
// These tests are about data flow, not chart rendering.
@Component({ selector: 'app-sred-projects-echarts', template: '' })
class SredProjectsEchartsStub {}

@Component({ selector: 'app-employee-breakdown-echarts', template: '' })
class EmployeeBreakdownEchartsStub {}

@Component({ selector: 'app-employee-modal', template: '' })
class EmployeeModalStub {}

// ── Fixtures ──────────────────────────────────────────────────────────────────
// APP_CONSTANTS.CURRENT_DATE = '2026-05-19'
// Claim period: 2026-01-01 → 2026-12-31
//
// Q1 entries (Jan): 3 × 8 = 24 hrs  (inside Q1 and YTD)
// Q2 entry  (Apr): 1 × 8 = 8 hrs   (inside Q2 and YTD, outside Q1)
// ──────────────────────────────────────────────────────────────
// Expected: Q1 = 24 hrs, Q2 = 8 hrs, YTD = 32 hrs
// This makes currentValue and ytdValue distinguishable when on Q1.

const MOCK_CLIENT = {
  id: 'c-test',
  name: 'Test Co',
  claimPeriods: [{ id: '2026', startDate: '2026-01-01', endDate: '2026-12-31' }],
  province: 'ON',
  timeZone: 'EST',
  sredCreditRate: 0.45,
  lastUpdatedAt: '2026-01-01',
  claimStatus: 'Active',
};

const MOCK_EMPLOYEES = [
  { id: 'emp-1', name: 'Alice', email: 'a@test.ca', hireDate: '2022-01-01', annualSalary: 100_000, role: 'Engineer', color: '#000', teamId: 'team-1' },
];

const MOCK_PROJECTS = [
  { id: 'proj-sred', name: 'SR&ED Project', description: '', isSredEligible: true, color: '#f00' },
];

const MOCK_TIME_ENTRIES = [
  // Q1 — Jan 5, 6, 7 → 24 hrs
  { id: 'e1', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-01-05', hours: 8 },
  { id: 'e2', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-01-06', hours: 8 },
  { id: 'e3', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-01-07', hours: 8 },
  // Q2 — Apr 15 → 8 hrs (in YTD, not in Q1)
  { id: 'e4', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-04-15', hours: 8 },
];

const Q1_HOURS = 24;
const YTD_HOURS = 32;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRouteMock() {
  const parent = {
    paramMap: of(convertToParamMap({ tenantId: 'tenant-1' })),
    snapshot: { params: { tenantId: 'tenant-1' } },
  };
  return { parent };
}

function configureTestBed(timeEntriesValue: unknown = of(MOCK_TIME_ENTRIES)) {
  TestBed
    .configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ActivatedRoute,    useValue: makeRouteMock() },
        { provide: ClientsService,    useValue: { getCurrent: () => of(MOCK_CLIENT) } },
        { provide: EmployeesService,  useValue: { getAll: () => of(MOCK_EMPLOYEES) } },
        { provide: ProjectsService,   useValue: { getAll: () => of(MOCK_PROJECTS) } },
        { provide: TimeEntriesService, useValue: { getAll: () => timeEntriesValue } },
        { provide: TeamsService,      useValue: { getAll: () => of([]) } },
        { provide: ToastService,      useValue: { show: () => {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(DashboardComponent, {
      remove: { imports: [SredProjectsEchartsComponent, EmployeeBreakdownEchartsComponent, EmployeeModalComponent] },
      add:    { imports: [SredProjectsEchartsStub, EmployeeBreakdownEchartsStub, EmployeeModalStub] },
    });
}

async function setupWithData() {
  configureTestBed();
  await TestBed.compileComponents();

  const fixture = TestBed.createComponent(DashboardComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

function dualKpiPanel(fixture: ReturnType<typeof TestBed.createComponent<DashboardComponent>>) {
  return fixture.debugElement
    .query(By.directive(DualKpiPanelComponent))
    .componentInstance as DualKpiPanelComponent;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DashboardComponent → DualKpiPanelComponent bindings', () => {

  it('passes ytdValue (always YTD total, not period-specific)', async () => {
    const fixture = await setupWithData();
    expect(dualKpiPanel(fixture).ytdValue()).toBe(YTD_HOURS);
  });

  it('passes daysElapsed so the projection equation is non-zero', async () => {
    const fixture = await setupWithData();
    expect(dualKpiPanel(fixture).daysElapsed()).toBeGreaterThan(0);
  });

  it('passes currentValue = Q1 hours (not YTD) when period switches to Q1', async () => {
    const fixture = await setupWithData();
    fixture.componentInstance.onPeriodSelect('q1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dualKpiPanel(fixture).currentValue()).toBe(Q1_HOURS);
  });

  it('keeps ytdValue stable at YTD total even after switching to Q1', async () => {
    const fixture = await setupWithData();
    fixture.componentInstance.onPeriodSelect('q1');
    fixture.detectChanges();
    await fixture.whenStable();

    // ytdValue must stay at full YTD, never shrink to the selected period
    expect(dualKpiPanel(fixture).ytdValue()).toBe(YTD_HOURS);
  });

  it('passes mode to dual-kpi-panel when mode changes', async () => {
    const fixture = await setupWithData();
    fixture.componentInstance.onModeChange('expenditures');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dualKpiPanel(fixture).mode()).toBe('expenditures');
  });

  it('passes selectedPeriod to dual-kpi-panel when period changes', async () => {
    const fixture = await setupWithData();
    fixture.componentInstance.onPeriodSelect('q1');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dualKpiPanel(fixture).selectedPeriod()).toBe('q1');
  });

  it('passes a non-null projectedValue on YTD tab (mid-year projection)', async () => {
    const fixture = await setupWithData();
    // Default period is ytd; projected should be > ytdValue since we are mid-year
    const projected = dualKpiPanel(fixture).projectedValue();
    expect(projected).not.toBeNull();
    expect(projected!).toBeGreaterThan(YTD_HOURS);
  });
});

describe('DashboardComponent — loading state', () => {

  it('hides dual-kpi-panel while data is still loading', async () => {
    const entries$ = new Subject<typeof MOCK_TIME_ENTRIES>();
    configureTestBed(entries$);
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // Time entries have not emitted yet — panel must be absent (skeleton shown instead)
    const panelEl = fixture.debugElement.query(By.directive(DualKpiPanelComponent));
    expect(panelEl).toBeNull();
  });

  it('shows dual-kpi-panel after all data arrives', async () => {
    const entries$ = new Subject<typeof MOCK_TIME_ENTRIES>();
    configureTestBed(entries$);
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    entries$.next(MOCK_TIME_ENTRIES);
    entries$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    const panelEl = fixture.debugElement.query(By.directive(DualKpiPanelComponent));
    expect(panelEl).not.toBeNull();
  });
});

describe('DashboardComponent — quarterly tabs', () => {

  it('produces exactly 5 tabs (q1 q2 q3 q4 ytd) with correct values', async () => {
    const fixture = await setupWithData();
    const tabs = fixture.componentInstance.quarterlyTabs();

    expect(tabs.map(t => t.period)).toEqual(['q1', 'q2', 'q3', 'q4', 'ytd']);
    expect(tabs.find(t => t.period === 'q1')!.value).toBe(Q1_HOURS);
    expect(tabs.find(t => t.period === 'q2')!.value).toBe(8);
    expect(tabs.find(t => t.period === 'ytd')!.value).toBe(YTD_HOURS);
  });
});
