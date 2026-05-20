import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Team } from '../../../../core/models/team.model';
import { Employee } from '../../../../core/models/employee.model';
import { SredMode, StaffBarEntry, StaffDisplayMode } from '../../models/chart-data.model';
import { StaffEmployeeCardComponent } from '../staff-employee-card/staff-employee-card';
import { InfoTooltipComponent } from '../../../../shared/components/info-tooltip/info-tooltip';

interface TeamGroup {
  readonly label: string;
  readonly teamId: string | null;
  readonly entries: readonly StaffBarEntry[];
}

const DISPLAY_MODE_OPTIONS: readonly { value: StaffDisplayMode; label: string }[] = [
  { value: 'sred', label: 'SR&ED' },
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'both', label: 'Both' },
];

@Component({
  selector: 'app-staff-section',
  imports: [StaffEmployeeCardComponent, InfoTooltipComponent],
  templateUrl: './staff-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffSectionComponent {
  readonly teams = input.required<readonly Team[]>();
  readonly employees = input.required<readonly Employee[]>();
  readonly staffData = input.required<readonly StaffBarEntry[]>();
  readonly mode = input.required<SredMode>();
  readonly employeeClick = output<string>();

  readonly totalCount = computed(() => this.employees().length);

  readonly displayMode = signal<StaffDisplayMode>('both');

  readonly displayModeOptions = DISPLAY_MODE_OPTIONS;

  setDisplayMode(m: StaffDisplayMode): void {
    this.displayMode.set(m);
  }

  readonly groups = computed<readonly TeamGroup[]>(() => {
    const teams = this.teams();
    const employees = this.employees();
    const staffData = this.staffData();

    const byEmpId = new Map(staffData.map(s => [s.employeeId, s]));

    const unassigned = employees
      .filter(emp => !emp.teamId)
      .map(emp => byEmpId.get(emp.id))
      .filter((s): s is StaffBarEntry => !!s);

    const teamGroups: TeamGroup[] = teams.map(team => ({
      label: team.name,
      teamId: team.id,
      entries: employees
        .filter(emp => emp.teamId === team.id)
        .map(emp => byEmpId.get(emp.id))
        .filter((s): s is StaffBarEntry => !!s),
    }));

    const result: TeamGroup[] = [];
    if (unassigned.length > 0) {
      result.push({ label: 'Staff not Assigned to Team', teamId: null, entries: unassigned });
    }
    return [...result, ...teamGroups];
  });
}
