import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, startWith } from 'rxjs/operators';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { TeamsService } from './services/teams.service';
import { ModeTabsComponent } from './components/mode-tabs/mode-tabs';
import { QuarterlyTimelineComponent, QuarterTab } from './components/quarterly-timeline/quarterly-timeline';
import { DualKpiPanelComponent } from './components/dual-kpi-panel/dual-kpi-panel';
import { SredProjectsBarComponent } from './components/sred-projects-bar/sred-projects-bar';
import { SredProjectsDonutComponent } from './components/sred-projects-donut/sred-projects-donut';
import { EmployeeBreakdownBarComponent } from './components/employee-breakdown-bar/employee-breakdown-bar';
import { EmployeeBreakdownDonutComponent } from './components/employee-breakdown-donut/employee-breakdown-donut';
import { StaffSectionComponent } from './components/staff-section/staff-section';
import { EmployeeModalComponent } from '../../shared/components/employee-modal/employee-modal';
import { StaffSalaryTableComponent } from './components/staff-salary-table/staff-salary-table';
import { InfoTooltipComponent } from '../../shared/components/info-tooltip/info-tooltip';
import { ToastService } from '../../shared/services/toast.service';
import { PageHeaderComponent } from '../../core/components/page-header/page-header';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import {
  projectFullYear,
  hourlyRate,
} from './calculations';
import {
  quarterBoundaries,
  filterEntriesByPeriod,
} from './calculations/quarterly';
import {
  sredTotalHours,
  sredTotalCost,
  sredCredits,
} from './calculations/sred-totals';
import {
  projectBarData,
  employeeBreakdownData,
  employeeProjectBars,
} from './calculations/project-bar-data';
import { staffBarData } from './calculations/staff-bar-data';
import { SredMode, QuarterPeriod, EmployeeRow, ChartView } from './models/chart-data.model';
import { Client, ClaimPeriod } from '../../core/models/client.model';
import { Employee } from '../../core/models/employee.model';
import { Project } from './models/project.model';
import { TimeEntry } from './models/time-entry.model';
import { Team } from '../../core/models/team.model';

const QUARTER_LABELS: Record<QuarterPeriod, string> = {
  q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4', ytd: 'Year to Date',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return iso;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    ModeTabsComponent,
    QuarterlyTimelineComponent,
    DualKpiPanelComponent,
    SredProjectsBarComponent,
    SredProjectsDonutComponent,
    EmployeeBreakdownBarComponent,
    EmployeeBreakdownDonutComponent,
    StaffSectionComponent,
    EmployeeModalComponent,
    StaffSalaryTableComponent,
    InfoTooltipComponent,
    PageHeaderComponent,
    CurrencyPipe,
    DecimalPipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly clientsSvc = inject(ClientsService);
  private readonly employeesSvc = inject(EmployeesService);
  private readonly projectsSvc = inject(ProjectsService);
  private readonly timeEntriesSvc = inject(TimeEntriesService);
  private readonly teamsSvc = inject(TeamsService);
  private readonly toastSvc = inject(ToastService);

  private readonly route = inject(ActivatedRoute);
  private readonly tenantId = toSignal(
    this.route.parent!.paramMap.pipe(map(p => p.get('tenantId') ?? '')),
    { initialValue: this.route.parent!.snapshot.params['tenantId'] as string ?? '' },
  );

  readonly client = toSignal<Client | null, Client | null>(
    toObservable(this.tenantId).pipe(
      switchMap(id => this.clientsSvc.getCurrent(id)),
    ),
    { initialValue: null },
  );
  readonly employees = toSignal(
    toObservable(this.tenantId).pipe(
      switchMap(id => this.employeesSvc.getAll(id).pipe(startWith([] as readonly Employee[]))),
    ),
    { initialValue: [] as readonly Employee[] },
  );
  readonly projects = toSignal(
    toObservable(this.tenantId).pipe(
      switchMap(id => this.projectsSvc.getAll(id).pipe(startWith([] as readonly Project[]))),
    ),
    { initialValue: [] as readonly Project[] },
  );
  readonly timeEntries = toSignal(
    toObservable(this.tenantId).pipe(
      switchMap(id => this.timeEntriesSvc.getAll(id).pipe(startWith([] as readonly TimeEntry[]))),
    ),
    { initialValue: [] as readonly TimeEntry[] },
  );
  readonly teams = toSignal(
    toObservable(this.tenantId).pipe(
      switchMap(id => this.teamsSvc.getAll(id).pipe(startWith([] as readonly Team[]))),
    ),
    { initialValue: [] as readonly Team[] },
  );

  readonly mode = signal<SredMode>('hours');
  readonly selectedPeriod = signal<QuarterPeriod>('ytd');
  readonly drilledProjectId = signal<string | null>(null);
  readonly chartView = signal<ChartView>('bar');
  readonly activeClaimPeriodId = signal<string | null>(null);

  readonly activeClaimPeriod = computed(() => {
    const c = this.client();
    if (!c) return null;
    const id = this.activeClaimPeriodId();
    const found = id ? c.claimPeriods.find(p => p.id === id) : null;
    if (found) return found;
    // Default: period containing today (asOf)
    return c.claimPeriods.find(p => p.startDate <= APP_CONSTANTS.CURRENT_DATE && p.endDate >= APP_CONSTANTS.CURRENT_DATE)
      ?? c.claimPeriods[c.claimPeriods.length - 1]
      ?? null;
  });
  readonly selectedEmployeeId = signal<string | null>(null);
  readonly modalMode = signal<SredMode>('hours');
  readonly isPeriodOpen = signal(false);

  readonly lastUpdatedAt = signal('15 May 2026');
  readonly isRecalculating = signal(false);

  readonly isLoading = computed(() =>
    !this.client() ||
    this.employees().length === 0 ||
    this.projects().length === 0 ||
    this.timeEntries().length === 0,
  );

  readonly asOf = computed(() => {
    const p = this.activeClaimPeriod();
    if (!p) return APP_CONSTANTS.CURRENT_DATE;
    return p.endDate < APP_CONSTANTS.CURRENT_DATE ? p.endDate : APP_CONSTANTS.CURRENT_DATE;
  });

  readonly periodEntries = computed(() => {
    const p = this.activeClaimPeriod();
    if (!p) return [];
    const { start, end } = quarterBoundaries(this.selectedPeriod(), p.startDate, this.asOf());
    return filterEntriesByPeriod(this.timeEntries(), start, end);
  });

  readonly quarterlyTabs = computed<readonly QuarterTab[]>(() => {
    const c = this.client();
    const p = this.activeClaimPeriod();
    if (!c || !p) return [];
    const entries = this.timeEntries();
    const employees = this.employees();
    const projects = this.projects();
    const mode = this.mode();
    const creditRate = c.sredCreditRate ?? 0.45;
    const year = parseInt(p.startDate.slice(0, 4), 10);

    const PERIODS: QuarterPeriod[] = ['q1', 'q2', 'q3', 'q4', 'ytd'];
    const SUBLABELS: Record<QuarterPeriod, string> = {
      q1: `Jan 1 – Mar 31, ${year}`,
      q2: `Apr 1 – Jun 30, ${year}`,
      q3: `Jul 1 – Sep 30, ${year}`,
      q4: `Oct 1 – Dec 31, ${year}`,
      ytd: `${formatShortDate(p.startDate)} – ${formatShortDate(this.asOf())}`,
    };

    return PERIODS.map(period => {
      const { start, end } = quarterBoundaries(period, p.startDate, this.asOf());
      const pEntries = filterEntriesByPeriod(entries, start, end);
      let value: number;
      if (mode === 'hours') {
        value = sredTotalHours(pEntries, projects);
      } else {
        const cost = sredTotalCost(pEntries, employees, projects);
        value = mode === 'credits' ? sredCredits(cost, creditRate) : cost;
      }
      return { period, label: QUARTER_LABELS[period], sublabel: SUBLABELS[period], value };
    });
  });

  readonly currentKpiValue = computed(() => {
    const tab = this.quarterlyTabs().find(t => t.period === this.selectedPeriod());
    return tab?.value ?? 0;
  });

  readonly ytdValue = computed(() => {
    const tab = this.quarterlyTabs().find(t => t.period === 'ytd');
    return tab?.value ?? 0;
  });

  readonly projectedFullYearValue = computed<number | null>(() => {
    const p = this.activeClaimPeriod();
    if (!p) return null;
    return projectFullYear(
      this.ytdValue(),
      p.startDate,
      p.endDate,
      this.asOf(),
    ).projectedFullYear;
  });

  readonly projectBars = computed(() =>
    projectBarData(
      this.periodEntries(),
      this.employees(),
      this.projects(),
      this.mode(),
      this.client()?.sredCreditRate ?? 0.45,
    ),
  );

  readonly drilledProject = computed(() => {
    const id = this.drilledProjectId();
    return id ? (this.projects().find(p => p.id === id) ?? null) : null;
  });

  readonly drilledProjectValue = computed<number | null>(() => {
    const id = this.drilledProjectId();
    if (!id) return null;
    const bar = this.projectBars().find(b => b.projectId === id);
    return bar?.value ?? 0;
  });

  readonly employeeBreakdownBars = computed(() => {
    const projectId = this.drilledProjectId();
    if (!projectId) return [];
    return employeeBreakdownData(
      this.periodEntries(),
      this.employees(),
      projectId,
      this.mode(),
      this.client()?.sredCreditRate ?? 0.45,
      this.drilledProject()?.isSredEligible ?? false,
    );
  });

  readonly staffBars = computed(() =>
    staffBarData(
      this.periodEntries(),
      this.employees(),
      this.projects(),
      this.mode(),
      this.client()?.sredCreditRate ?? 0.45,
    ),
  );

  readonly employeeRows = computed<readonly EmployeeRow[]>(() => {
    const p = this.activeClaimPeriod();
    if (!p) return [];
    const { start, end } = quarterBoundaries('ytd', p.startDate, this.asOf());
    const ytdEntries = filterEntriesByPeriod(this.timeEntries(), start, end);
    return this.employees().map(emp => {
      const ytdHours = ytdEntries
        .filter(e => e.employeeId === emp.id)
        .reduce((sum, e) => sum + e.hours, 0);
      const rate = hourlyRate(emp);
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        hireDate: emp.hireDate,
        endDate: emp.endDate,
        annualSalary: emp.annualSalary,
        confirmedSalary: emp.confirmedSalary,
        isSpecialEmployee: emp.isSpecialEmployee ?? false,
        hourlyRate: rate,
        ytdHours,
        ytdCost: ytdHours * rate,
        color: emp.color,
      };
    });
  });

  readonly selectedEmployee = computed(() => {
    const id = this.selectedEmployeeId();
    return id ? (this.employees().find(e => e.id === id) ?? null) : null;
  });

  readonly modalProjectBars = computed(() => {
    const emp = this.selectedEmployee();
    if (!emp) return [];
    return employeeProjectBars(
      this.periodEntries(),
      emp,
      this.projects(),
      this.modalMode(),
      this.client()?.sredCreditRate ?? 0.45,
    );
  });

  readonly modalSredHours = computed(() => {
    const id = this.selectedEmployeeId();
    if (!id) return 0;
    return sredTotalHours(
      this.periodEntries().filter(e => e.employeeId === id),
      this.projects(),
    );
  });

  readonly modalSredCost = computed(() => {
    const id = this.selectedEmployeeId();
    if (!id) return 0;
    return sredTotalCost(
      this.periodEntries().filter(e => e.employeeId === id),
      this.employees(),
      this.projects(),
    );
  });

  readonly modalSredCredits = computed(() => {
    const rate = this.client()?.sredCreditRate ?? 0.45;
    return sredCredits(this.modalSredCost(), rate);
  });

  readonly modalTotalHours = computed(() => {
    const id = this.selectedEmployeeId();
    if (!id) return 0;
    return this.periodEntries()
      .filter(e => e.employeeId === id)
      .reduce((sum, e) => sum + e.hours, 0);
  });

  readonly modalPeriodLabel = computed(() => {
    const p = this.activeClaimPeriod();
    if (!p) return '';
    const { start, end } = quarterBoundaries(this.selectedPeriod(), p.startDate, this.asOf());
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  });

  onRecalculate(): void {
    if (this.isRecalculating()) return;
    this.isRecalculating.set(true);
    setTimeout(() => {
      this.isRecalculating.set(false);
      this.lastUpdatedAt.set(
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      );
      this.toastSvc.show('Projections recalculated');
    }, 800);
  }

  onModeChange(mode: SredMode): void { this.mode.set(mode); }
  onPeriodSelect(period: QuarterPeriod): void {
    this.selectedPeriod.set(period);
    this.drilledProjectId.set(null);
  }
  togglePeriodDropdown(): void { this.isPeriodOpen.update(v => !v); }

  formatPeriodRange(p: ClaimPeriod): string {
    const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return `${fmt(p.startDate)} – ${fmt(p.endDate)} ${p.endDate.slice(0, 4)}`;
  }

  onClaimPeriodChange(periodId: string): void {
    this.activeClaimPeriodId.set(periodId);
    this.selectedPeriod.set('ytd');
    this.drilledProjectId.set(null);
  }
  // chartView persists across drill depth: donut top-level → donut employee breakdown
  onChartViewChange(v: ChartView): void { this.chartView.set(v); }
  onProjectClick(projectId: string): void {
    if (!document.startViewTransition) { this.drilledProjectId.set(projectId); return; }
    document.startViewTransition(() => { this.drilledProjectId.set(projectId); });
  }

  onDrillBack(): void {
    if (!document.startViewTransition) { this.drilledProjectId.set(null); return; }
    document.startViewTransition(() => { this.drilledProjectId.set(null); });
  }
  onEmployeeClick(employeeId: string): void {
    this.selectedEmployeeId.set(employeeId);
    this.modalMode.set(this.mode());
  }
  onModalClose(): void { this.selectedEmployeeId.set(null); }
  onModalModeChange(mode: SredMode): void { this.modalMode.set(mode); }
}
