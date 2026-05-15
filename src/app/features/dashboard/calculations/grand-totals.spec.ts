import { describe, it, expect } from 'vitest';
import { grandTotalHours, grandTotalCost } from './grand-totals';
import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: id, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});
const e = (id: string, employeeId: string, projectId: string, date: string, hours: number): TimeEntry =>
  ({ id, employeeId, projectId, date, hours });

const EMPLOYEES = [emp('a', 60000), emp('b', 120000)];
const ENTRIES = [
  e('1', 'a', 'p1', '2025-01-10', 4),
  e('2', 'a', 'p2', '2025-02-10', 6),
  e('3', 'b', 'p1', '2025-03-10', 3),
];

describe('grandTotalHours', () => {
  it('sums hours across all entries up to asOf', () => {
    expect(grandTotalHours(ENTRIES, '2025-09-30')).toBe(13);
  });

  it('returns 0 for empty entries', () => {
    expect(grandTotalHours([], '2025-09-30')).toBe(0);
  });
});

describe('grandTotalCost', () => {
  it('sums monetary cost across all employees and projects', () => {
    // a: (4+6) × 30 = 300
    // b: 3 × 60 = 180
    expect(grandTotalCost(EMPLOYEES, ENTRIES, '2025-09-30')).toBe(480);
  });
});
