import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { StaffBarEntry } from '../models/chart-data.model';

export function staffBarData(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
): StaffBarEntry[] {
  const eligibleIds = new Set(projects.filter(p => p.isSredEligible).map(p => p.id));

  return employees.map(emp => {
    let sredHours = 0;
    let unclaimedHours = 0;
    for (const e of periodEntries) {
      if (e.employeeId !== emp.id) continue;
      if (eligibleIds.has(e.projectId)) {
        sredHours += e.hours;
      } else {
        unclaimedHours += e.hours;
      }
    }
    return { employeeId: emp.id, name: emp.name, sredHours, unclaimedHours };
  });
}
