import { describe, it, expect } from 'vitest';
import { staffBarData } from './staff-bar-data';
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string): Employee => ({
  id, name: `Name-${id}`, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: 60000, role: 'r',
});
const proj = (id: string, eligible: boolean): Project => ({
  id, name: id, description: '', isSredEligible: eligible,
});
const e = (empId: string, projId: string, hours: number): TimeEntry => ({
  id: `${empId}-${projId}`, employeeId: empId, projectId: projId, date: '2025-05-01', hours,
});

const EMPLOYEES = [emp('a'), emp('b')];
const PROJECTS = [proj('p-sred', true), proj('p-unclaim', false)];
const ENTRIES = [
  e('a', 'p-sred', 8),
  e('a', 'p-unclaim', 4),
  e('b', 'p-sred', 3),
];

// annualSalary=60000, HOURS_PER_YEAR=2000 → hourlyRate=30
const HOURLY_RATE = 30;

describe('staffBarData', () => {
  it('hours mode: splits hours into SR&ED and unclaimed per employee', () => {
    const result = staffBarData(ENTRIES, EMPLOYEES, PROJECTS, 'hours', 0.45);
    const a = result.find(r => r.employeeId === 'a');
    const b = result.find(r => r.employeeId === 'b');
    expect(a?.sredValue).toBe(8);
    expect(a?.unclaimedValue).toBe(4);
    expect(b?.sredValue).toBe(3);
    expect(b?.unclaimedValue).toBe(0);
  });

  it('expenditures mode: computes cost (hours × hourlyRate) per segment', () => {
    const result = staffBarData(ENTRIES, EMPLOYEES, PROJECTS, 'expenditures', 0.45);
    const a = result.find(r => r.employeeId === 'a');
    expect(a?.sredValue).toBeCloseTo(8 * HOURLY_RATE);
    expect(a?.unclaimedValue).toBeCloseTo(4 * HOURLY_RATE);
  });

  it('credits mode: applies creditRate to SR&ED cost, unclaimedValue is 0', () => {
    const creditRate = 0.45;
    const result = staffBarData(ENTRIES, EMPLOYEES, PROJECTS, 'credits', creditRate);
    const a = result.find(r => r.employeeId === 'a');
    expect(a?.sredValue).toBeCloseTo(8 * HOURLY_RATE * creditRate);
    expect(a?.unclaimedValue).toBe(0);
  });

  it('returns an entry for every employee even with zero hours', () => {
    const result = staffBarData([], EMPLOYEES, PROJECTS, 'hours', 0.45);
    expect(result).toHaveLength(2);
    expect(result.every(r => r.sredValue === 0 && r.unclaimedValue === 0)).toBe(true);
  });
});
