import { TimeEntry } from '../models/time-entry.model';
import { QuarterPeriod } from '../models/chart-data.model';

export function quarterBoundaries(
  period: QuarterPeriod,
  claimStartIso: string,
  asOfIso: string,
): { start: string; end: string } {
  const year = parseInt(claimStartIso.slice(0, 4), 10);
  switch (period) {
    case 'q1': return { start: `${year}-01-01`, end: `${year}-03-31` };
    case 'q2': return { start: `${year}-04-01`, end: `${year}-06-30` };
    case 'q3': return { start: `${year}-07-01`, end: `${year}-09-30` };
    case 'q4': return { start: `${year}-10-01`, end: `${year}-12-31` };
    case 'ytd': return { start: claimStartIso, end: asOfIso };
  }
}

export function filterEntriesByPeriod(
  entries: readonly TimeEntry[],
  start: string,
  end: string,
): readonly TimeEntry[] {
  return entries.filter(e => e.date >= start && e.date <= end);
}
