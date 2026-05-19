import { EmployeeRow as BaseEmployeeRow } from '../../dashboard/models/chart-data.model';

export type EmployeeStatus = 'active' | 'terminated';

export interface EmployeesPageRow extends BaseEmployeeRow {
  readonly teamName: string;
  readonly status: EmployeeStatus;
}

export type SortKey =
  | 'name' | 'teamName' | 'role' | 'status' | 'hireDate' | 'endDate'
  | 'annualSalary' | 'confirmedSalary' | 'hourlyRate' | 'ytdHours';

export type SortDir = 'asc' | 'desc';

export interface EmployeeFilters {
  readonly search: string;
  readonly team: string | null;
  readonly role: string | null;
  readonly status: EmployeeStatus | null;
}
