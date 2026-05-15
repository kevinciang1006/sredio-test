import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';
import { hourlyRate } from './hourly-rate';

export function grandTotalHours(entries: readonly TimeEntry[], asOfIso: string): number {
  let total = 0;
  for (const e of entries) if (e.date <= asOfIso) total += e.hours;
  return total;
}

export function grandTotalCost(
  employees: readonly Employee[],
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  const rateById = new Map<string, number>();
  for (const emp of employees) rateById.set(emp.id, hourlyRate(emp));

  let total = 0;
  for (const e of entries) {
    if (e.date > asOfIso) continue;
    const rate = rateById.get(e.employeeId);
    if (rate === undefined) continue;
    total += e.hours * rate;
  }
  return total;
}
