export type ChartMode = 'hours' | 'cost';

export interface ProjectBreakdownSeries {
  readonly name: string;
  readonly data: readonly number[];
}

export interface ProjectBreakdownData {
  readonly categories: readonly string[];
  readonly series: readonly ProjectBreakdownSeries[];
}

export interface AggregateDatum {
  readonly project: string;
  readonly value: number;
}

export interface AggregateData {
  readonly data: readonly AggregateDatum[];
  readonly grandTotal: number;
}

export interface EmployeeRow {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly hireDate: string;
  readonly annualSalary: number;
  readonly hourlyRate: number;
  readonly ytdHours: number;
  readonly ytdCost: number;
}
