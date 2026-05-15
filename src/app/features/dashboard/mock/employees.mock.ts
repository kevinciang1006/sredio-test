import { Employee } from '../../../core/models/employee.model';

export const MOCK_EMPLOYEES: readonly Employee[] = [
  { id: 'emp-001', name: 'Aria Chen',       email: 'aria@northwindlabs.ca',     hireDate: '2022-04-11', annualSalary:  92000, role: 'Senior Engineer' },
  { id: 'emp-002', name: 'Benjamin Patel',  email: 'ben@northwindlabs.ca',      hireDate: '2023-09-05', annualSalary:  72000, role: 'Engineer' },
  { id: 'emp-003', name: 'Camille Dubois',  email: 'camille@northwindlabs.ca',  hireDate: '2021-01-18', annualSalary: 118000, role: 'Staff Engineer' },
  { id: 'emp-004', name: 'Devon Singh',     email: 'devon@northwindlabs.ca',    hireDate: '2024-02-12', annualSalary:  56000, role: 'Junior Engineer' },
  { id: 'emp-005', name: 'Emiko Tanaka',    email: 'emiko@northwindlabs.ca',    hireDate: '2020-07-30', annualSalary: 105000, role: 'Senior Engineer' },
  { id: 'emp-006', name: 'Felix Okafor',    email: 'felix@northwindlabs.ca',    hireDate: '2023-03-22', annualSalary:  68000, role: 'Engineer' },
  { id: 'emp-007', name: 'Gianna Romano',   email: 'gianna@northwindlabs.ca',   hireDate: '2022-11-08', annualSalary:  85000, role: 'Senior Engineer' },
] as const;
