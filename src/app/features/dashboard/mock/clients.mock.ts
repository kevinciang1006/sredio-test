import { Client } from '../../../core/models/client.model';
import { TENANTS } from '../../../core/constants/tenants.const';

const SHARED_CLAIM_PERIOD = { startDate: '2025-01-01', endDate: '2025-12-31' };

export const MOCK_CLIENTS: Record<string, Client> = {
  [TENANTS[0].id]: {
    id: 'client-001',
    name: 'Northwind Labs',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'ON',
    timeZone: 'EST',
    sredCreditRate: 0.45,
  },
  [TENANTS[1].id]: {
    id: 'client-002',
    name: 'Maple Robotics',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'BC',
    timeZone: 'PST',
    sredCreditRate: 0.40,
  },
  [TENANTS[2].id]: {
    id: 'client-003',
    name: 'Quantum Dynamics',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'AB',
    timeZone: 'MST',
    sredCreditRate: 0.35,
  },
  [TENANTS[3].id]: {
    id: 'client-004',
    name: 'Cedar AI Labs',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'QC',
    timeZone: 'EST',
    sredCreditRate: 0.30,
  },
};

export const MOCK_CLIENT: Client = MOCK_CLIENTS[TENANTS[0].id];
