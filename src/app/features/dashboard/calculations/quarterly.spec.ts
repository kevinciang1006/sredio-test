import { describe, it, expect } from 'vitest';
import { quarterBoundaries, filterEntriesByPeriod } from './quarterly';
import { TimeEntry } from '../models/time-entry.model';

const e = (date: string): TimeEntry => ({ id: date, employeeId: 'a', projectId: 'p', date, hours: 1 });

describe('quarterBoundaries', () => {
  it('returns correct bounds for q1', () => {
    expect(quarterBoundaries('q1', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-01-01',
      end: '2025-03-31',
    });
  });

  it('returns correct bounds for q2', () => {
    expect(quarterBoundaries('q2', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-04-01',
      end: '2025-06-30',
    });
  });

  it('returns correct bounds for q3', () => {
    expect(quarterBoundaries('q3', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-07-01',
      end: '2025-09-30',
    });
  });

  it('returns correct bounds for q4', () => {
    expect(quarterBoundaries('q4', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-10-01',
      end: '2025-12-31',
    });
  });

  it('returns claim start to asOf for ytd', () => {
    expect(quarterBoundaries('ytd', '2025-01-01', '2025-09-30')).toEqual({
      start: '2025-01-01',
      end: '2025-09-30',
    });
  });
});

describe('filterEntriesByPeriod', () => {
  const entries = [
    e('2025-01-15'),
    e('2025-04-01'),
    e('2025-06-30'),
    e('2025-10-01'),
  ];

  it('returns only entries within bounds (inclusive)', () => {
    const result = filterEntriesByPeriod(entries, '2025-04-01', '2025-06-30');
    expect(result).toHaveLength(2);
    expect(result.map(x => x.date)).toEqual(['2025-04-01', '2025-06-30']);
  });

  it('returns empty array when no entries fall in period', () => {
    expect(filterEntriesByPeriod(entries, '2025-11-01', '2025-11-30')).toHaveLength(0);
  });
});
