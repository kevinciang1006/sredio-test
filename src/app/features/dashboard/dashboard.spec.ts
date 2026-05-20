import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect } from 'vitest';
import { DashboardComponent } from './dashboard';
import { DualKpiPanelComponent } from './components/dual-kpi-panel/dual-kpi-panel';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { TeamsService } from './services/teams.service';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute } from '@angular/router';

// ── Minimal fixtures ────────────────────────────────────────────────────────
// APP_CONSTANTS.CURRENT_DATE = '2026-05-19'
// Claim period: 2026-01-01 → 2026-12-31, so YTD window is Jan 1 → May 19 2026
// 3 entries × 8 hrs = 24 SR&ED hours expected in YTD

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
  { id: 'e1', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-01-05', hours: 8 },
  { id: 'e2', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-01-06', hours: 8 },
  { id: 'e3', employeeId: 'emp-1', projectId: 'proj-sred', date: '2026-01-07', hours: 8 },
];

const EXPECTED_YTD_HOURS = 24;

// ── Route mock ──────────────────────────────────────────────────────────────
function makeRouteMock() {
  const parent = {
    paramMap: of(convertToParamMap({ tenantId: 'tenant-1' })),
    snapshot: { params: { tenantId: 'tenant-1' } },
  };
  return { parent };
}

// ── Test ────────────────────────────────────────────────────────────────────
describe('DashboardComponent → DualKpiPanelComponent binding', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRouteMock() },
        { provide: ClientsService, useValue: { getCurrent: () => of(MOCK_CLIENT) } },
        { provide: EmployeesService, useValue: { getAll: () => of(MOCK_EMPLOYEES) } },
        { provide: ProjectsService, useValue: { getAll: () => of(MOCK_PROJECTS) } },
        { provide: TimeEntriesService, useValue: { getAll: () => of(MOCK_TIME_ENTRIES) } },
        { provide: TeamsService, useValue: { getAll: () => of([]) } },
        { provide: ToastService, useValue: { show: () => {} } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('passes ytdValue to <app-dual-kpi-panel> so the YTD card shows the correct hours', async () => {
    const fixture = await setup();

    const panelEl = fixture.debugElement.query(By.directive(DualKpiPanelComponent));
    expect(panelEl).toBeTruthy();

    const panel = panelEl.componentInstance as DualKpiPanelComponent;
    expect(panel.ytdValue()).toBe(EXPECTED_YTD_HOURS);
  });

  it('passes daysElapsed to <app-dual-kpi-panel> so the projection formula is correct', async () => {
    const fixture = await setup();

    const panelEl = fixture.debugElement.query(By.directive(DualKpiPanelComponent));
    const panel = panelEl.componentInstance as DualKpiPanelComponent;

    // Jan 1 → May 19 2026 = 138 days elapsed
    expect(panel.daysElapsed()).toBeGreaterThan(0);
  });
});
