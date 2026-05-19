import { EmployeesPageRow, EmployeeFilters, SortKey, SortDir } from '../models/employee-row';

export function filterAndSortEmployees(
  rows: readonly EmployeesPageRow[],
  filters: EmployeeFilters,
  sortKey: SortKey | null,
  sortDir: SortDir,
): readonly EmployeesPageRow[] {
  const search = filters.search.trim().toLowerCase();
  const filtered = rows.filter(r => {
    if (search && !r.name.toLowerCase().includes(search)) return false;
    if (filters.team && r.teamName !== filters.team) return false;
    if (filters.role && r.role !== filters.role) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  if (!sortKey) return filtered;
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => compareBy(a, b, sortKey) * dir);
}

function compareBy(a: EmployeesPageRow, b: EmployeesPageRow, key: SortKey): number {
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av).localeCompare(String(bv));
}
