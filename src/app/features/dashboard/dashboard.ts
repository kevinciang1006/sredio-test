import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { ClientHeaderComponent } from './components/client-header/client-header';
import { SummaryCardComponent } from './components/summary-card/summary-card';
import { HoursCostToggleComponent } from './components/hours-cost-toggle/hours-cost-toggle';
import { ProjectBreakdownChartComponent } from './components/project-breakdown-chart/project-breakdown-chart';
import { AggregateChartComponent } from './components/aggregate-chart/aggregate-chart';
import { EmployeeGridComponent } from './components/employee-grid/employee-grid';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import {
  hourlyRate,
  projectTotalHours,
  projectTotalCost,
  grandTotalHours,
  grandTotalCost,
  employeeHoursOnProject,
  employeeCostOnProject,
  projectFullYear,
} from './calculations';
import {
  AggregateData,
  ChartMode,
  EmployeeRow,
  ProjectBreakdownData,
} from './models/chart-data.model';
import { Client } from '../../core/models/client.model';
import { Employee } from '../../core/models/employee.model';
import { Project } from './models/project.model';
import { TimeEntry } from './models/time-entry.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    ClientHeaderComponent,
    SummaryCardComponent,
    HoursCostToggleComponent,
    ProjectBreakdownChartComponent,
    AggregateChartComponent,
    EmployeeGridComponent,
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

  readonly client = toSignal<Client | null, Client | null>(this.clientsSvc.getCurrent(), {
    initialValue: null,
  });
  readonly employees = toSignal<readonly Employee[], readonly Employee[]>(
    this.employeesSvc.getAll(),
    { initialValue: [] },
  );
  readonly projects = toSignal<readonly Project[], readonly Project[]>(
    this.projectsSvc.getAll(),
    { initialValue: [] },
  );
  readonly timeEntries = toSignal<readonly TimeEntry[], readonly TimeEntry[]>(
    this.timeEntriesSvc.getAll(),
    { initialValue: [] },
  );

  readonly mode = signal<ChartMode>('hours');

  readonly isLoading = computed(() =>
    !this.client() ||
    this.employees().length === 0 ||
    this.projects().length === 0 ||
    this.timeEntries().length === 0,
  );

  readonly asOf = APP_CONSTANTS.CURRENT_DATE;

  readonly ytdTotalHours = computed(() =>
    grandTotalHours(this.timeEntries(), this.asOf),
  );

  readonly ytdTotalCost = computed(() =>
    grandTotalCost(this.employees(), this.timeEntries(), this.asOf),
  );

  readonly projectedFullYearHours = computed(() => {
    const c = this.client();
    if (!c) return 0;
    return projectFullYear(
      this.ytdTotalHours(),
      c.claimPeriod.startDate,
      c.claimPeriod.endDate,
      this.asOf,
    ).projectedFullYear;
  });

  readonly projectedFullYearCost = computed(() => {
    const c = this.client();
    if (!c) return 0;
    return projectFullYear(
      this.ytdTotalCost(),
      c.claimPeriod.startDate,
      c.claimPeriod.endDate,
      this.asOf,
    ).projectedFullYear;
  });

  readonly projectsBreakdown = computed<ProjectBreakdownData>(() => {
    const projects = this.projects();
    const employees = this.employees();
    const entries = this.timeEntries();
    const isCost = this.mode() === 'cost';

    return {
      categories: projects.map(p => p.name),
      series: employees.map(emp => ({
        name: emp.name,
        data: projects.map(p =>
          isCost
            ? employeeCostOnProject(emp, p.id, entries, this.asOf)
            : employeeHoursOnProject(emp.id, p.id, entries, this.asOf),
        ),
      })),
    };
  });

  readonly aggregateData = computed<AggregateData>(() => {
    const projects = this.projects();
    const entries = this.timeEntries();
    const employees = this.employees();
    const isCost = this.mode() === 'cost';

    const data = projects.map(p => ({
      project: p.name,
      value: isCost
        ? projectTotalCost(p.id, employees, entries, this.asOf)
        : projectTotalHours(p.id, entries, this.asOf),
    }));
    const grandTotal = isCost ? this.ytdTotalCost() : this.ytdTotalHours();
    return { data, grandTotal };
  });

  readonly employeeRows = computed<readonly EmployeeRow[]>(() => {
    const entries = this.timeEntries();
    const projects = this.projects();
    return this.employees().map(emp => {
      const ytdHours = projects.reduce(
        (sum, p) => sum + employeeHoursOnProject(emp.id, p.id, entries, this.asOf),
        0,
      );
      const rate = hourlyRate(emp);
      return {
        id: emp.id,
        name: emp.name,
        hireDate: emp.hireDate,
        annualSalary: emp.annualSalary,
        hourlyRate: rate,
        ytdHours,
        ytdCost: ytdHours * rate,
      };
    });
  });

  onModeChange(next: ChartMode): void {
    this.mode.set(next);
  }
}
