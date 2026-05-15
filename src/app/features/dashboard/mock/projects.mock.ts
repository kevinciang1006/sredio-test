import { Project } from '../models/project.model';

export const MOCK_PROJECTS: readonly Project[] = [
  { id: 'proj-001', name: 'Rendering System',         description: 'Real-time WebGL rendering pipeline rewrite.',                    isSredEligible: true  },
  { id: 'proj-002', name: 'API Performance',          description: 'Latency reduction for the public REST API.',                     isSredEligible: true  },
  { id: 'proj-003', name: 'Mobile App Platform',      description: 'Native iOS/Android shell with cross-platform business logic.',   isSredEligible: true  },
  { id: 'proj-004', name: 'ML Inference Pipeline',    description: 'Custom inference runtime for tax-credit eligibility scoring.',   isSredEligible: true  },
  { id: 'proj-005', name: 'Unclaimed Work',           description: 'Internal tooling and operational work not eligible for SR&ED.',  isSredEligible: false },
] as const;
