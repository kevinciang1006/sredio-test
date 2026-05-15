import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';
import { hourlyRate } from './hourly-rate';

function isWithin(entry: TimeEntry, asOfIso: string): boolean {
  return entry.date <= asOfIso;
}

export function employeeHoursOnProject(
  employeeId: string,
  projectId: string,
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  let total = 0;
  for (const e of entries) {
    if (e.employeeId === employeeId && e.projectId === projectId && isWithin(e, asOfIso)) {
      total += e.hours;
    }
  }
  return total;
}

export function employeeCostOnProject(
  employee: Employee,
  projectId: string,
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  return employeeHoursOnProject(employee.id, projectId, entries, asOfIso) * hourlyRate(employee);
}

export function projectTotalHours(
  projectId: string,
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  let total = 0;
  for (const e of entries) {
    if (e.projectId === projectId && isWithin(e, asOfIso)) {
      total += e.hours;
    }
  }
  return total;
}

export function projectTotalCost(
  projectId: string,
  employees: readonly Employee[],
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  let total = 0;
  for (const emp of employees) {
    total += employeeCostOnProject(emp, projectId, entries, asOfIso);
  }
  return total;
}
