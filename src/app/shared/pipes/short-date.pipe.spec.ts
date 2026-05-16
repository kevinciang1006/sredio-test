import { describe, it, expect } from 'vitest';
import { ShortDatePipe } from './short-date.pipe';

describe('ShortDatePipe', () => {
  const pipe = new ShortDatePipe();

  it('formats YYYY-MM-DD as "D Mon YYYY"', () => {
    expect(pipe.transform('2025-01-01')).toBe('1 Jan 2025');
    expect(pipe.transform('2022-04-11')).toBe('11 Apr 2022');
    expect(pipe.transform('2020-07-30')).toBe('30 Jul 2020');
  });

  it('handles single-digit days without padding', () => {
    expect(pipe.transform('2023-09-05')).toBe('5 Sep 2023');
  });

  it('does not shift day due to UTC/local timezone offset', () => {
    // Date.parse("YYYY-MM-DD") treats it as UTC midnight, which can show
    // the previous day in western timezones. We parse year/month/day directly.
    expect(pipe.transform('2024-02-12')).toBe('12 Feb 2024');
    expect(pipe.transform('2022-11-08')).toBe('8 Nov 2022');
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
