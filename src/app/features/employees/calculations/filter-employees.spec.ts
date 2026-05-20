import { describe, it, expect } from 'vitest';
import { filterAndSortEmployees } from './filter-employees';
import { EmployeesPageRow } from '../models/employee-row';

function row(overrides: Partial<EmployeesPageRow> = {}): EmployeesPageRow {
  return {
    id: 'e1',
    name: 'Alice',
    role: 'Engineer',
    teamName: 'Platform',
    status: 'active',
    hireDate: '2024-01-01',
    endDate: undefined,
    annualSalary: 100000,
    confirmedSalary: 100000,
    hourlyRate: 50,
    ytdHours: 1000,
    ytdCost: 50000,
    color: '#3b82f6',
    isSpecialEmployee: false,
    ...overrides,
  };
}

describe('filterAndSortEmployees', () => {
  const rows: readonly EmployeesPageRow[] = [
    row({ id: 'e1', name: 'Alice',   teamName: 'Platform', role: 'Engineer',  status: 'active',     hourlyRate: 50, hireDate: '2024-01-01' }),
    row({ id: 'e2', name: 'Bob',     teamName: 'Mobile',   role: 'Engineer',  status: 'active',     hourlyRate: 40, hireDate: '2023-06-01' }),
    row({ id: 'e3', name: 'Charlie', teamName: 'Platform', role: 'Manager',   status: 'terminated', hourlyRate: 60, hireDate: '2022-03-01', endDate: '2025-12-31' }),
  ];

  it('returns all rows when no filters and no sort', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('filters by case-insensitive name search', () => {
    const out = filterAndSortEmployees(rows, { search: 'ali', team: null, role: null, status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e1']);
  });

  it('filters by team', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: 'Mobile', role: null, status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e2']);
  });

  it('filters by role', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: 'Manager', status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e3']);
  });

  it('filters by status', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: 'terminated' }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e3']);
  });

  it('combines multiple filters', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: 'Platform', role: null, status: 'active' }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e1']);
  });

  it('sorts by hourlyRate ascending', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'hourlyRate', 'asc');
    expect(out.map(r => r.hourlyRate)).toEqual([40, 50, 60]);
  });

  it('sorts by hourlyRate descending', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'hourlyRate', 'desc');
    expect(out.map(r => r.hourlyRate)).toEqual([60, 50, 40]);
  });

  it('sorts by name string ascending', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'name', 'asc');
    expect(out.map(r => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('puts undefined endDate last when sorting asc by endDate', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'endDate', 'asc');
    expect(out.map(r => r.id)).toEqual(['e3', 'e1', 'e2']);
  });
});
