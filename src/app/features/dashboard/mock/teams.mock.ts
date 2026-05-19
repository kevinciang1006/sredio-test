import { Team } from '../../../core/models/team.model';

export const MOCK_TEAMS: readonly Team[] = [
  { id: 'team-001', name: 'Platform Team' },
  { id: 'team-002', name: 'Mobile Team' },
] as const;
