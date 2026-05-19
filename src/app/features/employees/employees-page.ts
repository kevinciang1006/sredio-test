import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmployeesService } from '../dashboard/services/employees.service';
import { TeamsService } from '../dashboard/services/teams.service';
import { TimeEntriesService } from '../dashboard/services/time-entries.service';
import { hourlyRate } from '../dashboard/calculations';
import { Employee } from '../../core/models/employee.model';
import { Team } from '../../core/models/team.model';
import { TimeEntry } from '../dashboard/models/time-entry.model';
import { EmployeesPageRow, EmployeeFilters, EmployeeStatus, SortKey, SortDir } from './models/employee-row';
import { filterAndSortEmployees } from './calculations/filter-employees';
import { EmployeesTableComponent } from './components/employees-table';
import { PageHeaderComponent } from '../../core/components/page-header/page-header';
import { EmployeeModalComponent } from '../../shared/components/employee-modal/employee-modal';
import { SredMode } from '../dashboard/models/chart-data.model';

@Component({
  selector: 'app-employees-page',
  imports: [EmployeesTableComponent, PageHeaderComponent, EmployeeModalComponent],
  templateUrl: './employees-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesPageComponent {
  private readonly employeesSvc = inject(EmployeesService);
  private readonly teamsSvc = inject(TeamsService);
  private readonly timeEntriesSvc = inject(TimeEntriesService);

  readonly employees = toSignal<readonly Employee[], readonly Employee[]>(
    this.employeesSvc.getAll(), { initialValue: [] },
  );
  readonly teams = toSignal<readonly Team[], readonly Team[]>(
    this.teamsSvc.getAll(), { initialValue: [] },
  );
  readonly timeEntries = toSignal<readonly TimeEntry[], readonly TimeEntry[]>(
    this.timeEntriesSvc.getAll(), { initialValue: [] },
  );

  readonly search = signal('');
  readonly teamFilter = signal<string | null>(null);
  readonly roleFilter = signal<string | null>(null);
  readonly statusFilter = signal<EmployeeStatus | null>(null);
  readonly sortKey = signal<SortKey | null>(null);
  readonly sortDir = signal<SortDir>('asc');

  readonly selectedEmployeeId = signal<string | null>(null);

  readonly allRows = computed<readonly EmployeesPageRow[]>(() => {
    const teamsById = new Map(this.teams().map(t => [t.id, t.name]));
    const hoursByEmp = new Map<string, number>();
    for (const e of this.timeEntries()) {
      hoursByEmp.set(e.employeeId, (hoursByEmp.get(e.employeeId) ?? 0) + e.hours);
    }
    return this.employees().map(emp => {
      const rate = hourlyRate(emp);
      const ytdHours = hoursByEmp.get(emp.id) ?? 0;
      const status: EmployeeStatus = emp.endDate ? 'terminated' : 'active';
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        teamName: emp.teamId ? (teamsById.get(emp.teamId) ?? 'Unknown') : 'Unassigned',
        status,
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

  readonly availableTeams = computed(() =>
    Array.from(new Set(this.allRows().map(r => r.teamName))).sort()
  );
  readonly availableRoles = computed(() =>
    Array.from(new Set(this.allRows().map(r => r.role))).sort()
  );

  readonly filters = computed<EmployeeFilters>(() => ({
    search: this.search(),
    team: this.teamFilter(),
    role: this.roleFilter(),
    status: this.statusFilter(),
  }));

  readonly filteredRows = computed(() =>
    filterAndSortEmployees(this.allRows(), this.filters(), this.sortKey(), this.sortDir())
  );

  readonly selectedEmployee = computed(() => {
    const id = this.selectedEmployeeId();
    return id ? (this.employees().find(e => e.id === id) ?? null) : null;
  });

  onSearchInput(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }
  onTeamChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.teamFilter.set(v || null);
  }
  onRoleChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.roleFilter.set(v || null);
  }
  onStatusChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value as EmployeeStatus | '';
    this.statusFilter.set(v || null);
  }

  onSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  onRowClick(employeeId: string): void {
    this.selectedEmployeeId.set(employeeId);
  }
  closeModal(): void { this.selectedEmployeeId.set(null); }
  noop(_: SredMode): void { /* mode switching not wired on this page */ }
}
