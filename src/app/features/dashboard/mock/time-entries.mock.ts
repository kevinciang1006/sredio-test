import { TimeEntry } from '../models/time-entry.model';

// Deterministic seeded RNG so the data is identical every run.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function generate(): readonly TimeEntry[] {
  const rng = makeRng(0xC0FFEE);
  const employees = ['emp-001','emp-002','emp-003','emp-004','emp-005','emp-006','emp-007'];
  // Each employee's project distribution weights (0..1). Some employees focus on certain projects.
  const weights: Record<string, readonly number[]> = {
    'emp-001': [0.45, 0.20, 0.05, 0.20, 0.10],
    'emp-002': [0.10, 0.50, 0.10, 0.20, 0.10],
    'emp-003': [0.30, 0.30, 0.10, 0.25, 0.05],
    'emp-004': [0.20, 0.15, 0.45, 0.10, 0.10],
    'emp-005': [0.05, 0.15, 0.10, 0.55, 0.15],
    'emp-006': [0.25, 0.25, 0.25, 0.10, 0.15],
    'emp-007': [0.35, 0.10, 0.20, 0.25, 0.10],
  };
  const projects = ['proj-001','proj-002','proj-003','proj-004','proj-005'];

  const start = new Date('2024-01-01').getTime();
  const end   = new Date('2026-05-19').getTime();
  const ms = 1000 * 60 * 60 * 24;

  const entries: TimeEntry[] = [];
  let id = 1;

  for (let t = start; t <= end; t += ms) {
    const d = new Date(t);
    const day = d.getUTCDay();
    if (day === 0 || day === 6) continue; // skip weekends

    for (const emp of employees) {
      // ~85% chance an employee logged any hours on a given weekday
      if (rng() > 0.85) continue;

      // Total hours that day (3..9)
      const totalHours = 3 + Math.floor(rng() * 7);
      // Split across 1..3 projects per day, weighted
      const projectsPicked = 1 + Math.floor(rng() * 3);
      const w = weights[emp]!;
      const picked = new Set<number>();
      while (picked.size < projectsPicked) {
        // weighted pick
        let r = rng();
        let idx = 0;
        for (; idx < projects.length - 1; idx++) {
          r -= w[idx]!;
          if (r <= 0) break;
        }
        picked.add(idx);
      }
      const pickedArr = [...picked];
      let remaining = totalHours;
      for (let i = 0; i < pickedArr.length; i++) {
        const isLast = i === pickedArr.length - 1;
        const hours = isLast ? remaining : Math.max(1, Math.floor((remaining / (pickedArr.length - i)) * (0.6 + rng() * 0.8)));
        remaining -= hours;
        if (hours <= 0) continue;
        entries.push({
          id: `te-${String(id++).padStart(6, '0')}`,
          employeeId: emp,
          projectId: projects[pickedArr[i]!]!,
          date: d.toISOString().slice(0, 10),
          hours,
        });
      }
    }
  }

  return entries;
}

export const MOCK_TIME_ENTRIES: readonly TimeEntry[] = generate();
