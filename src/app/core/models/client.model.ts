export interface Client {
  readonly id: string;
  readonly name: string;
  readonly claimPeriod: {
    readonly startDate: string;
    readonly endDate: string;
  };
  readonly province: string;
  readonly timeZone: string;
}
