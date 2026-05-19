import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { TeamsService } from './services/teams.service';
import { ClientHeaderComponent } from './components/client-header/client-header';
import { ModeTabsComponent } from './components/mode-tabs/mode-tabs';
import { QuarterlyTimelineComponent, QuarterTab } from './components/quarterly-timeline/quarterly-timeline';
import { DualKpiPanelComponent } from './components/dual-kpi-panel/dual-kpi-panel';
import { SredProjectsBarComponent } from './components/sred-projects-bar/sred-projects-bar';
import { EmployeeBreakdownBarComponent } from './components/employee-breakdown-bar/employee-breakdown-bar';
import { StaffSectionComponent } from './components/staff-section/staff-section';
import { EmployeeModalComponent } from './components/employee-modal/employee-modal';
import { StaffSalaryTableComponent } from './components/staff-salary-table/staff-salary-table';
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
import { SredMode, QuarterPeriod, EmployeeRow } from './models/chart-data.model';
import { Client } from '../../core/models/client.model';
import { Employee } from '../../core/models/employee.model';
import { Project } from './models/project.model';
import { TimeEntry } from './models/time-entry.model';
import { Team } from '../../core/models/team.model';

const QUARTER_LABELS: Record<QuarterPeriod, string> = {
  q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4', ytd: 'Year to Date',
};

@Component({
  selector: 'app-dashboard',
  imports: [
    ClientHeaderComponent,
    ModeTabsComponent,
    QuarterlyTimelineComponent,
    DualKpiPanelComponent,
    SredProjectsBarComponent,
    EmployeeBreakdownBarComponent,
    StaffSectionComponent,
    EmployeeModalComponent,
    StaffSalaryTableComponent,
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

  private readonly route = inject(ActivatedRoute);
  private readonly tenantId = this.route.snapshot.params['tenantId'] as string;

  readonly client = toSignal<Client | null, Client | null>(this.clientsSvc.getCurrent(this.tenantId), {
    initialValue: null,
  });
  readonly employees = toSignal<readonly Employee[], readonly Employee[]>(
    this.employeesSvc.getAll(), { initialValue: [] },
  );
  readonly projects = toSignal<readonly Project[], readonly Project[]>(
    this.projectsSvc.getAll(), { initialValue: [] },
  );
  readonly timeEntries = toSignal<readonly TimeEntry[], readonly TimeEntry[]>(
    this.timeEntriesSvc.getAll(), { initialValue: [] },
  );
  readonly teams = toSignal<readonly Team[], readonly Team[]>(
    this.teamsSvc.getAll(), { initialValue: [] },
  );

  readonly mode = signal<SredMode>('hours');
  readonly selectedPeriod = signal<QuarterPeriod>('ytd');
  readonly drilledProjectId = signal<string | null>(null);
  readonly selectedEmployeeId = signal<string | null>(null);
  readonly modalMode = signal<SredMode>('hours');

  readonly isLoading = computed(() =>
    !this.client() ||
    this.employees().length === 0 ||
    this.projects().length === 0 ||
    this.timeEntries().length === 0,
  );

  readonly asOf = APP_CONSTANTS.CURRENT_DATE;

  readonly periodEntries = computed(() => {
    const c = this.client();
    if (!c) return [];
    const { start, end } = quarterBoundaries(this.selectedPeriod(), c.claimPeriod.startDate, this.asOf);
    return filterEntriesByPeriod(this.timeEntries(), start, end);
  });

  readonly quarterlyTabs = computed<readonly QuarterTab[]>(() => {
    const c = this.client();
    if (!c) return [];
    const entries = this.timeEntries();
    const employees = this.employees();
    const projects = this.projects();
    const mode = this.mode();
    const creditRate = c.sredCreditRate ?? 0.45;
    const year = parseInt(c.claimPeriod.startDate.slice(0, 4), 10);

    const PERIODS: QuarterPeriod[] = ['q1', 'q2', 'q3', 'q4', 'ytd'];
    const SUBLABELS: Record<QuarterPeriod, string> = {
      q1: `Jan 1 – Mar 31, ${year}`,
      q2: `Apr 1 – Jun 30, ${year}`,
      q3: `Jul 1 – Sep 30, ${year}`,
      q4: `Oct 1 – Dec 31, ${year}`,
      ytd: `${c.claimPeriod.startDate} – ${this.asOf}`,
    };

    return PERIODS.map(period => {
      const { start, end } = quarterBoundaries(period, c.claimPeriod.startDate, this.asOf);
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

  readonly projectedFullYearValue = computed<number | null>(() => {
    if (this.selectedPeriod() !== 'ytd') return null;
    const c = this.client();
    if (!c) return null;
    return projectFullYear(
      this.currentKpiValue(),
      c.claimPeriod.startDate,
      c.claimPeriod.endDate,
      this.asOf,
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
    staffBarData(this.periodEntries(), this.employees(), this.projects()),
  );

  readonly employeeRows = computed<readonly EmployeeRow[]>(() => {
    const c = this.client();
    if (!c) return [];
    const { start, end } = quarterBoundaries('ytd', c.claimPeriod.startDate, this.asOf);
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

  readonly modalTotalHours = computed(() => {
    const id = this.selectedEmployeeId();
    if (!id) return 0;
    return this.periodEntries()
      .filter(e => e.employeeId === id)
      .reduce((sum, e) => sum + e.hours, 0);
  });

  readonly modalPeriodLabel = computed(() => {
    const c = this.client();
    if (!c) return '';
    const { start, end } = quarterBoundaries(this.selectedPeriod(), c.claimPeriod.startDate, this.asOf);
    return `${start} – ${end}`;
  });

  onModeChange(mode: SredMode): void { this.mode.set(mode); }
  onPeriodSelect(period: QuarterPeriod): void {
    this.selectedPeriod.set(period);
    this.drilledProjectId.set(null);
  }
  onProjectClick(projectId: string): void { this.drilledProjectId.set(projectId); }
  onDrillBack(): void { this.drilledProjectId.set(null); }
  onEmployeeClick(employeeId: string): void {
    this.selectedEmployeeId.set(employeeId);
    this.modalMode.set(this.mode());
  }
  onModalClose(): void { this.selectedEmployeeId.set(null); }
  onModalModeChange(mode: SredMode): void { this.modalMode.set(mode); }
}
