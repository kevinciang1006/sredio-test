import { Team } from '../../../core/models/team.model';
import { TENANTS } from '../../../core/constants/tenants.const';

export const MOCK_TEAMS_BY_TENANT: Record<string, readonly Team[]> = {
  [TENANTS[0].id]: [
    { id: 'team-001', name: 'Platform Team' },
    { id: 'team-002', name: 'Mobile Team' },
  ],
  [TENANTS[1].id]: [
    { id: 'team-001', name: 'Robotics Core' },
    { id: 'team-002', name: 'Firmware' },
  ],
  [TENANTS[2].id]: [
    { id: 'team-001', name: 'Quantum Research' },
    { id: 'team-002', name: 'Systems' },
  ],
  [TENANTS[3].id]: [
    { id: 'team-001', name: 'AI Research' },
    { id: 'team-002', name: 'Data Eng' },
  ],
};
