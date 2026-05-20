import { Employee } from '../../../core/models/employee.model';
import { TENANTS } from '../../../core/constants/tenants.const';

export const MOCK_EMPLOYEES_BY_TENANT: Record<string, readonly Employee[]> = {
  [TENANTS[0].id]: [
    { id: 'emp-001', name: 'Aria Chen',      email: 'aria@northwindlabs.ca',    hireDate: '2022-04-11', annualSalary:  92000, role: 'Senior Engineer', color: '#3b82f6', teamId: 'team-001', confirmedSalary:  94000 },
    { id: 'emp-002', name: 'Benjamin Patel', email: 'ben@northwindlabs.ca',     hireDate: '2023-09-05', annualSalary:  72000, role: 'Engineer',        color: '#0891b2', teamId: 'team-002', confirmedSalary:  72000 },
    { id: 'emp-003', name: 'Camille Dubois', email: 'camille@northwindlabs.ca', hireDate: '2021-01-18', annualSalary: 118000, role: 'Staff Engineer',   color: '#059669', teamId: 'team-001', confirmedSalary: 120000 },
    { id: 'emp-004', name: 'Devon Singh',    email: 'devon@northwindlabs.ca',   hireDate: '2024-02-12', annualSalary:  56000, role: 'Junior Engineer',  color: '#d97706', teamId: 'team-002' },
    { id: 'emp-005', name: 'Emiko Tanaka',   email: 'emiko@northwindlabs.ca',   hireDate: '2020-07-30', annualSalary: 105000, role: 'Senior Engineer',  color: '#dc2626', teamId: 'team-001', confirmedSalary: 105000 },
    { id: 'emp-006', name: 'Felix Okafor',   email: 'felix@northwindlabs.ca',   hireDate: '2023-03-22', annualSalary:  68000, role: 'Engineer',         color: '#7c3aed', teamId: 'team-002' },
    { id: 'emp-007', name: 'Gianna Romano',  email: 'gianna@northwindlabs.ca',  hireDate: '2022-11-08', annualSalary:  85000, role: 'Senior Engineer',  color: '#be185d', teamId: 'team-001', isSpecialEmployee: true, confirmedSalary: 85000 },
  ],
  [TENANTS[1].id]: [
    { id: 'emp-001', name: 'Kenji Watanabe', email: 'kenji@maplerobotics.ca',   hireDate: '2021-06-14', annualSalary:  98000, role: 'Senior Engineer', color: '#3b82f6', teamId: 'team-001', confirmedSalary: 100000 },
    { id: 'emp-002', name: 'Priya Sharma',   email: 'priya@maplerobotics.ca',   hireDate: '2023-01-09', annualSalary:  75000, role: 'Engineer',        color: '#0891b2', teamId: 'team-002', confirmedSalary:  75000 },
    { id: 'emp-003', name: 'Liam Tremblay',  email: 'liam@maplerobotics.ca',    hireDate: '2020-03-22', annualSalary: 125000, role: 'Staff Engineer',   color: '#059669', teamId: 'team-001', confirmedSalary: 128000 },
    { id: 'emp-004', name: 'Nadia Kovacs',   email: 'nadia@maplerobotics.ca',   hireDate: '2024-07-01', annualSalary:  58000, role: 'Junior Engineer',  color: '#d97706', teamId: 'team-002' },
    { id: 'emp-005', name: 'Omar Hassan',    email: 'omar@maplerobotics.ca',    hireDate: '2019-11-05', annualSalary: 112000, role: 'Senior Engineer',  color: '#dc2626', teamId: 'team-001', confirmedSalary: 112000 },
    { id: 'emp-006', name: 'Sophie Leclerc', email: 'sophie@maplerobotics.ca',  hireDate: '2022-08-17', annualSalary:  71000, role: 'Engineer',         color: '#7c3aed', teamId: 'team-002', confirmedSalary:  71000 },
    { id: 'emp-007', name: 'Tyler Nguyen',   email: 'tyler@maplerobotics.ca',   hireDate: '2023-05-30', annualSalary:  80000, role: 'Senior Engineer',  color: '#be185d', teamId: 'team-001', isSpecialEmployee: true, confirmedSalary: 82000 },
  ],
  [TENANTS[2].id]: [
    { id: 'emp-001', name: 'Elena Vasquez',  email: 'elena@quantumdynamics.ca', hireDate: '2020-02-03', annualSalary: 108000, role: 'Senior Engineer', color: '#3b82f6', teamId: 'team-001', confirmedSalary: 110000 },
    { id: 'emp-002', name: 'Marcus Webb',    email: 'marcus@quantumdynamics.ca',hireDate: '2022-10-11', annualSalary:  78000, role: 'Engineer',        color: '#0891b2', teamId: 'team-002', confirmedSalary:  78000 },
    { id: 'emp-003', name: 'Ingrid Larsen',  email: 'ingrid@quantumdynamics.ca',hireDate: '2019-07-15', annualSalary: 132000, role: 'Staff Engineer',   color: '#059669', teamId: 'team-001', confirmedSalary: 135000 },
    { id: 'emp-004', name: 'Raj Kapoor',     email: 'raj@quantumdynamics.ca',   hireDate: '2024-01-20', annualSalary:  60000, role: 'Junior Engineer',  color: '#d97706', teamId: 'team-002' },
    { id: 'emp-005', name: 'Yuki Sato',      email: 'yuki@quantumdynamics.ca',  hireDate: '2021-04-08', annualSalary:  95000, role: 'Senior Engineer',  color: '#dc2626', teamId: 'team-001', confirmedSalary:  96000 },
    { id: 'emp-006', name: 'Dana Petrova',   email: 'dana@quantumdynamics.ca',  hireDate: '2023-06-19', annualSalary:  65000, role: 'Engineer',         color: '#7c3aed', teamId: 'team-002' },
    { id: 'emp-007', name: 'Carlos Rivera',  email: 'carlos@quantumdynamics.ca',hireDate: '2022-03-14', annualSalary:  89000, role: 'Senior Engineer',  color: '#be185d', teamId: 'team-001', isSpecialEmployee: true, confirmedSalary: 90000 },
  ],
  [TENANTS[3].id]: [
    { id: 'emp-001', name: 'Fatima Al-Amin', email: 'fatima@cedarlabs.ca',      hireDate: '2021-09-27', annualSalary: 115000, role: 'Senior Engineer', color: '#3b82f6', teamId: 'team-001', confirmedSalary: 118000 },
    { id: 'emp-002', name: 'Hugo Beaumont',  email: 'hugo@cedarlabs.ca',        hireDate: '2023-02-14', annualSalary:  76000, role: 'Engineer',        color: '#0891b2', teamId: 'team-002', confirmedSalary:  76000 },
    { id: 'emp-003', name: 'Mei-Ling Zhou',  email: 'mei@cedarlabs.ca',         hireDate: '2019-05-06', annualSalary: 140000, role: 'Staff Engineer',   color: '#059669', teamId: 'team-001', confirmedSalary: 142000 },
    { id: 'emp-004', name: 'Alexei Morozov', email: 'alexei@cedarlabs.ca',      hireDate: '2024-04-01', annualSalary:  62000, role: 'Junior Engineer',  color: '#d97706', teamId: 'team-002' },
    { id: 'emp-005', name: 'Isabelle Roy',   email: 'isabelle@cedarlabs.ca',    hireDate: '2020-12-10', annualSalary: 102000, role: 'Senior Engineer',  color: '#dc2626', teamId: 'team-001', confirmedSalary: 104000 },
    { id: 'emp-006', name: 'Samuel Osei',    email: 'samuel@cedarlabs.ca',      hireDate: '2022-07-25', annualSalary:  69000, role: 'Engineer',         color: '#7c3aed', teamId: 'team-002', confirmedSalary:  70000 },
    { id: 'emp-007', name: 'Chloé Martin',   email: 'chloe@cedarlabs.ca',       hireDate: '2023-11-03', annualSalary:  88000, role: 'Senior Engineer',  color: '#be185d', teamId: 'team-001', isSpecialEmployee: true, confirmedSalary: 88000 },
  ],
};
