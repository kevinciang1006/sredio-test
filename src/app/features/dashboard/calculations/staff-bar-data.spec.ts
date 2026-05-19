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

describe('staffBarData', () => {
  it('splits hours into SR&ED and unclaimed per employee', () => {
    const result = staffBarData(ENTRIES, EMPLOYEES, PROJECTS);
    const a = result.find(r => r.employeeId === 'a');
    const b = result.find(r => r.employeeId === 'b');
    expect(a?.sredHours).toBe(8);
    expect(a?.unclaimedHours).toBe(4);
    expect(b?.sredHours).toBe(3);
    expect(b?.unclaimedHours).toBe(0);
  });

  it('returns an entry for every employee even with zero hours', () => {
    const result = staffBarData([], EMPLOYEES, PROJECTS);
    expect(result).toHaveLength(2);
    expect(result.every(r => r.sredHours === 0 && r.unclaimedHours === 0)).toBe(true);
  });
});
