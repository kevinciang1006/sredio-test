import { daysBetween, daysElapsed } from './date-utils';

export interface Projection {
  readonly projectedFullYear: number;
  readonly remainder: number;
}

export function projectFullYear(
  ytdValue: number,
  claimStartIso: string,
  claimEndIso: string,
  currentDateIso: string,
): Projection {
  const elapsed = daysElapsed(claimStartIso, currentDateIso);
  const total = daysBetween(claimStartIso, claimEndIso);

  if (elapsed === 0 || total === 0) {
    return { projectedFullYear: ytdValue, remainder: 0 };
  }

  if (currentDateIso >= claimEndIso) {
    return { projectedFullYear: ytdValue, remainder: 0 };
  }

  const projected = (ytdValue / elapsed) * total;
  return {
    projectedFullYear: projected,
    remainder: projected - ytdValue,
  };
}
