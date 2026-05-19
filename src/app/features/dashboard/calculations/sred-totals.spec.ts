import { describe, it, expect } from 'vitest';
import { sredTotalHours, sredTotalCost, sredCredits } from './sred-totals';
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: id, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});
const proj = (id: string, eligible: boolean): Project => ({
  id, name: id, description: '', isSredEligible: eligible,
});
const e = (projectId: string, hours: number): TimeEntry => ({
  id: projectId, employeeId: 'a', projectId, date: '2025-05-01', hours,
});

const EMPLOYEES = [emp('a', 100000)]; // $50/hr (100000 / 2000)
const PROJECTS = [proj('p-sred', true), proj('p-unclaimed', false)];
const ENTRIES = [
  e('p-sred', 10),
  e('p-unclaimed', 20),
];

describe('sredTotalHours', () => {
  it('counts only SR&ED eligible project hours', () => {
    expect(sredTotalHours(ENTRIES, PROJECTS)).toBe(10);
  });

  it('returns 0 when no eligible entries', () => {
    expect(sredTotalHours([e('p-unclaimed', 5)], PROJECTS)).toBe(0);
  });
});

describe('sredTotalCost', () => {
  it('sums cost for SR&ED eligible hours only', () => {
    // 10 hrs × $50/hr = $500
    expect(sredTotalCost(ENTRIES, EMPLOYEES, PROJECTS)).toBe(500);
  });
});

describe('sredCredits', () => {
  it('returns cost multiplied by credit rate', () => {
    expect(sredCredits(1000, 0.45)).toBeCloseTo(450);
  });

  it('returns 0 for zero cost', () => {
    expect(sredCredits(0, 0.45)).toBe(0);
  });
});
