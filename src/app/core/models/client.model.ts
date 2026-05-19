export interface ClaimPeriod {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface Client {
  readonly id: string;
  readonly name: string;
  readonly claimPeriods: readonly ClaimPeriod[];
  readonly province: string;
  readonly timeZone: string;
  readonly sredCreditRate?: number;
  readonly lastUpdatedAt?: string;
  readonly claimStatus?: string;
}
