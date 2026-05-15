import { Employee } from '../../../core/models/employee.model';

export const HOURS_PER_YEAR = 2000;

export function hourlyRate(employee: Employee): number {
  return employee.annualSalary / HOURS_PER_YEAR;
}
