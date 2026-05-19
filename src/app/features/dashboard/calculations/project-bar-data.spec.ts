import { describe, it, expect } from 'vitest';
import { projectBarData, employeeBreakdownData, employeeProjectBars } from './project-bar-data';
import { Employee } from '../../../core/models/employee.model';
import { Project } from '../models/project.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: `Name-${id}`, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});
const proj = (id: string, eligible: boolean): Project => ({
  id, name: `Proj-${id}`, description: '', isSredEligible: eligible,
});
const e = (empId: string, projId: string, hours: number): TimeEntry => ({
  id: `${empId}-${projId}`, employeeId: empId, projectId: projId, date: '2025-05-01', hours,
});

const EMPLOYEES = [emp('a', 100000), emp('b', 60000)];
// a: $50/hr   b: $30/hr
const PROJECTS = [proj('sred', true), proj('unclaimed', false)];
const ENTRIES = [
  e('a', 'sred', 10),
  e('b', 'sred', 20),
  e('a', 'unclaimed', 5),
];

describe('projectBarData', () => {
  it('returns one bar per project in hours mode', () => {
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'hours', 0.45);
    expect(bars).toHaveLength(2);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBe(30);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBe(5);
  });

  it('assigns grey to unclaimed projects', () => {
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'hours', 0.45);
    expect(bars.find(b => b.projectId === 'unclaimed')?.color).toBe('#9ca3af');
  });

  it('computes expenditure mode correctly', () => {
    // a: 10×50=500, b: 20×30=600 → sred=1100; a: 5×50=250 → unclaimed=250
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'expenditures', 0.45);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBeCloseTo(1100);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBeCloseTo(250);
  });

  it('computes credits mode (eligible only scaled by rate)', () => {
    // sred=1100×0.45=495; unclaimed stays as cost (250, not credits)
    const bars = projectBarData(ENTRIES, EMPLOYEES, PROJECTS, 'credits', 0.45);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBeCloseTo(495);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBeCloseTo(250);
  });
});

describe('employeeBreakdownData', () => {
  it('returns one entry per employee with hours on that project', () => {
    const result = employeeBreakdownData(ENTRIES, EMPLOYEES, 'sred', 'hours', 0.45, true);
    expect(result).toHaveLength(2);
    expect(result.find(r => r.employeeId === 'a')?.value).toBe(10);
    expect(result.find(r => r.employeeId === 'b')?.value).toBe(20);
  });

  it('excludes employees with zero hours on that project', () => {
    const result = employeeBreakdownData(ENTRIES, EMPLOYEES, 'unclaimed', 'hours', 0.45, false);
    expect(result).toHaveLength(1);
    expect(result[0].employeeId).toBe('a');
  });
});

describe('employeeProjectBars', () => {
  it('returns per-project bars for a single employee, excluding zero-value projects', () => {
    const bars = employeeProjectBars(ENTRIES, EMPLOYEES[0], PROJECTS, 'hours', 0.45);
    expect(bars.find(b => b.projectId === 'sred')?.value).toBe(10);
    expect(bars.find(b => b.projectId === 'unclaimed')?.value).toBe(5);
    expect(bars).toHaveLength(2); // emp 'a' has hours on both projects
  });
});
