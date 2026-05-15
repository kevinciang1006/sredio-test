import { describe, it, expect } from 'vitest';
import { projectFullYear } from './projections';

describe('projectFullYear', () => {
  it('linearly extrapolates ytd to full year', () => {
    // claim 365 days, 90 elapsed, ytd 900 → projected = (900/90)*365 = 3650
    const out = projectFullYear(900, '2025-01-01', '2025-12-31', '2025-03-31');
    expect(out.projectedFullYear).toBe(3650);
    expect(out.remainder).toBe(2750);
  });

  it('returns ytd as projected when daysElapsed = 0', () => {
    const out = projectFullYear(500, '2025-06-01', '2025-12-31', '2025-01-01');
    expect(out.projectedFullYear).toBe(500);
    expect(out.remainder).toBe(0);
  });

  it('returns projected = ytd when currentDate >= endDate', () => {
    const out = projectFullYear(1000, '2025-01-01', '2025-12-31', '2025-12-31');
    expect(out.projectedFullYear).toBe(1000);
    expect(out.remainder).toBe(0);
  });

  it('handles zero ytd', () => {
    const out = projectFullYear(0, '2025-01-01', '2025-12-31', '2025-06-30');
    expect(out.projectedFullYear).toBe(0);
    expect(out.remainder).toBe(0);
  });
});
