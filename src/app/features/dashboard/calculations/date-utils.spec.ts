import { describe, it, expect } from 'vitest';
import { daysBetween, daysElapsed } from './date-utils';

describe('daysBetween', () => {
  it('computes inclusive days between two dates', () => {
    expect(daysBetween('2025-01-01', '2025-01-01')).toBe(1);
    expect(daysBetween('2025-01-01', '2025-01-02')).toBe(2);
    expect(daysBetween('2025-01-01', '2025-12-31')).toBe(365);
  });

  it('throws on invalid date strings', () => {
    expect(() => daysBetween('not-a-date', '2025-01-01')).toThrow('Invalid date');
  });
});

describe('daysElapsed', () => {
  it('returns inclusive days from claim start to current date', () => {
    expect(daysElapsed('2025-01-01', '2025-01-01')).toBe(1);
    expect(daysElapsed('2025-01-01', '2025-09-30')).toBe(273);
  });

  it('returns 0 when current is before start', () => {
    expect(daysElapsed('2025-06-01', '2025-01-01')).toBe(0);
  });
});
