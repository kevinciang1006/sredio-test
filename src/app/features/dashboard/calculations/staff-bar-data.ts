import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { SredMode, StaffBarEntry } from '../models/chart-data.model';
import { hourlyRate } from './hourly-rate';
import { sredCredits } from './sred-totals';

export function staffBarData(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
  mode: SredMode,
  creditRate: number,
): StaffBarEntry[] {
  const eligibleIds = new Set(projects.filter(p => p.isSredEligible).map(p => p.id));

  return employees.map(emp => {
    const rate = hourlyRate(emp);
    let sredValue = 0;
    let unclaimedValue = 0;
    for (const e of periodEntries) {
      if (e.employeeId !== emp.id) continue;
      if (mode === 'hours') {
        if (eligibleIds.has(e.projectId)) sredValue += e.hours;
        else unclaimedValue += e.hours;
      } else {
        const cost = e.hours * rate;
        if (eligibleIds.has(e.projectId)) {
          sredValue += mode === 'credits' ? sredCredits(cost, creditRate) : cost;
        } else {
          unclaimedValue += cost;
        }
      }
    }
    return { employeeId: emp.id, name: emp.name, sredValue, unclaimedValue, color: emp.color };
  });
}
