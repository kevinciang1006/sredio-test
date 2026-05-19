import { Project } from '../models/project.model';
import { TENANTS } from '../../../core/constants/tenants.const';

export const MOCK_PROJECTS_BY_TENANT: Record<string, readonly Project[]> = {
  [TENANTS[0].id]: [
    { id: 'proj-001', name: 'Rendering System',      description: 'Real-time WebGL rendering pipeline rewrite.',                   isSredEligible: true  },
    { id: 'proj-002', name: 'API Performance',        description: 'Latency reduction for the public REST API.',                    isSredEligible: true  },
    { id: 'proj-003', name: 'Mobile App Platform',    description: 'Native iOS/Android shell with cross-platform business logic.',  isSredEligible: true  },
    { id: 'proj-004', name: 'ML Inference Pipeline',  description: 'Custom inference runtime for tax-credit eligibility scoring.',  isSredEligible: true  },
    { id: 'proj-005', name: 'Unclaimed Work',         description: 'Internal tooling and operational work not eligible for SR&ED.', isSredEligible: false },
  ],
  [TENANTS[1].id]: [
    { id: 'proj-001', name: 'Arm Motion Controller',  description: 'Novel inverse-kinematics solver for 6-DOF robotic arms.',       isSredEligible: true  },
    { id: 'proj-002', name: 'Computer Vision Core',   description: 'Real-time object detection pipeline for factory automation.',    isSredEligible: true  },
    { id: 'proj-003', name: 'Edge Firmware Platform', description: 'Low-latency firmware runtime for embedded edge controllers.',    isSredEligible: true  },
    { id: 'proj-004', name: 'Sim-to-Real Transfer',   description: 'Reinforcement learning bridge between simulation and hardware.', isSredEligible: true  },
    { id: 'proj-005', name: 'Unclaimed Work',         description: 'Administrative and operational tasks not eligible for SR&ED.',   isSredEligible: false },
  ],
  [TENANTS[2].id]: [
    { id: 'proj-001', name: 'Qubit Error Correction', description: 'Surface-code implementation for fault-tolerant quantum gates.',  isSredEligible: true  },
    { id: 'proj-002', name: 'Quantum Compiler',       description: 'Circuit optimisation passes for near-term quantum hardware.',    isSredEligible: true  },
    { id: 'proj-003', name: 'Cryogenic Control Bus',  description: 'Ultra-low-noise FPGA interface for dilution refrigerators.',     isSredEligible: true  },
    { id: 'proj-004', name: 'Noise Characterisation', description: 'Statistical framework for device-level decoherence modelling.',  isSredEligible: true  },
    { id: 'proj-005', name: 'Unclaimed Work',         description: 'Lab maintenance and administrative tasks not eligible for SR&ED.',isSredEligible: false },
  ],
  [TENANTS[3].id]: [
    { id: 'proj-001', name: 'LLM Fine-Tuning Engine', description: 'Parameter-efficient fine-tuning for domain-specific language models.', isSredEligible: true  },
    { id: 'proj-002', name: 'Vector Search Layer',    description: 'Approximate nearest-neighbour index optimised for sparse embeddings.', isSredEligible: true  },
    { id: 'proj-003', name: 'RAG Pipeline',           description: 'Retrieval-augmented generation framework with citation grounding.',    isSredEligible: true  },
    { id: 'proj-004', name: 'Inference Acceleration', description: 'Kernel-level batching and quantisation for on-prem model serving.',    isSredEligible: true  },
    { id: 'proj-005', name: 'Unclaimed Work',         description: 'Internal operations and non-SR&ED eligible administrative work.',      isSredEligible: false },
  ],
};
