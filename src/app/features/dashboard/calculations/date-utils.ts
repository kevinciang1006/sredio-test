const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parse(iso: string): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) throw new Error(`Invalid date: ${iso}`);
  return t;
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = parse(startIso);
  const end = parse(endIso);
  if (end < start) return 0;
  return Math.round((end - start) / MS_PER_DAY) + 1;
}

export function daysElapsed(claimStartIso: string, currentDateIso: string): number {
  return daysBetween(claimStartIso, currentDateIso);
}
