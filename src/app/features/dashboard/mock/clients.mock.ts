import { Client } from '../../../core/models/client.model';

export const MOCK_CLIENT: Client = {
  id: 'client-001',
  name: 'Northwind Labs',
  claimPeriod: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  province: 'ON',
  timeZone: 'EST',
  sredCreditRate: 0.45,
};
