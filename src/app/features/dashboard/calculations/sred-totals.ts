import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';
import { hourlyRate } from './hourly-rate';

function eligibleSet(projects: readonly Project[]): Set<string> {
  return new Set(projects.filter(p => p.isSredEligible).map(p => p.id));
}

export function sredTotalHours(
  periodEntries: readonly TimeEntry[],
  projects: readonly Project[],
): number {
  const eligible = eligibleSet(projects);
  let total = 0;
  for (const e of periodEntries) {
    if (eligible.has(e.projectId)) total += e.hours;
  }
  return total;
}

export function sredTotalCost(
  periodEntries: readonly TimeEntry[],
  employees: readonly Employee[],
  projects: readonly Project[],
): number {
  const eligible = eligibleSet(projects);
  const rateById = new Map(employees.map(emp => [emp.id, hourlyRate(emp)]));
  let total = 0;
  for (const e of periodEntries) {
    if (!eligible.has(e.projectId)) continue;
    const rate = rateById.get(e.employeeId);
    if (rate === undefined) continue;
    total += e.hours * rate;
  }
  return total;
}

export function sredCredits(sredCost: number, creditRate: number): number {
  return sredCost * creditRate;
}
