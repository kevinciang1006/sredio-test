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
    let creditsValue = 0;
    let unclaimedValue = 0;
    for (const e of periodEntries) {
      if (e.employeeId !== emp.id) continue;
      if (eligibleIds.has(e.projectId)) {
        if (mode === 'hours') {
          sredValue += e.hours;
        } else {
          const cost = e.hours * rate;
          sredValue += cost;
          if (mode === 'credits') creditsValue += sredCredits(cost, creditRate);
        }
      } else {
        if (mode === 'hours') unclaimedValue += e.hours;
        else unclaimedValue += e.hours * rate;
      }
    }
    return { employeeId: emp.id, name: emp.name, sredValue, creditsValue, unclaimedValue, color: emp.color };
  });
}
