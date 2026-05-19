export interface TenantEntry {
  readonly id: string;
  readonly name: string;
  readonly adminId: string;
  readonly province: string;
}

export const TENANTS: readonly TenantEntry[] = [
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Northwind Labs',   adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'ON' },
  { id: 'a3bb189e-8bf9-3888-9912-ace4e6543002', name: 'Maple Robotics',   adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'BC' },
  { id: 'b9e4a3cc-1234-4c5d-8901-fde234567890', name: 'Quantum Dynamics', adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'AB' },
  { id: 'c7d8e9f0-abcd-4ef0-1234-567890abcdef', name: 'Cedar AI Labs',    adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'QC' },
];
