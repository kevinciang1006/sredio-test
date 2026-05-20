import { describe, it, expect } from 'vitest';
import {
  employeeHoursOnProject,
  employeeCostOnProject,
  projectTotalHours,
  projectTotalCost,
} from './project-totals';
import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: id, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r', color: '#3b82f6',
});

const entry = (id: string, employeeId: string, projectId: string, date: string, hours: number): TimeEntry => ({
  id, employeeId, projectId, date, hours,
});

const EMPLOYEES = [emp('a', 60000), emp('b', 120000)];
const ENTRIES: readonly TimeEntry[] = [
  entry('1', 'a', 'p1', '2025-01-15', 8),
  entry('2', 'a', 'p1', '2025-02-15', 4),
  entry('3', 'a', 'p2', '2025-02-20', 5),
  entry('4', 'b', 'p1', '2025-03-10', 6),
  entry('5', 'b', 'p2', '2025-04-01', 7),
  entry('6', 'a', 'p1', '2025-10-01', 9), // beyond asOf
];

describe('employeeHoursOnProject', () => {
  it('sums hours up to asOf inclusive', () => {
    expect(employeeHoursOnProject('a', 'p1', ENTRIES, '2025-09-30')).toBe(12);
  });

  it('returns 0 when employee has no hours on the project', () => {
    expect(employeeHoursOnProject('b', 'p3', ENTRIES, '2025-09-30')).toBe(0);
  });

  it('excludes entries after asOf', () => {
    expect(employeeHoursOnProject('a', 'p1', ENTRIES, '2025-03-01')).toBe(12); // 8+4
    expect(employeeHoursOnProject('a', 'p1', ENTRIES, '2025-01-31')).toBe(8);
  });
});

describe('employeeCostOnProject', () => {
  it('multiplies hours by hourly rate', () => {
    // 12 hours × ($60000/2000 = $30) = $360
    expect(employeeCostOnProject(EMPLOYEES[0], 'p1', ENTRIES, '2025-09-30')).toBe(360);
  });
});

describe('projectTotalHours', () => {
  it('sums all employees on a project', () => {
    // p1: a(12) + b(6) = 18
    expect(projectTotalHours('p1', ENTRIES, '2025-09-30')).toBe(18);
  });

  it('returns 0 for a project with no entries', () => {
    expect(projectTotalHours('p3', ENTRIES, '2025-09-30')).toBe(0);
  });
});

describe('projectTotalCost', () => {
  it('sums monetary cost across employees', () => {
    // p1: a(12 × 30 = 360) + b(6 × 60 = 360) = 720
    expect(projectTotalCost('p1', EMPLOYEES, ENTRIES, '2025-09-30')).toBe(720);
  });
});
