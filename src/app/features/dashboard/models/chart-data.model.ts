export type ChartMode = 'hours' | 'cost';
export type SredMode = 'hours' | 'expenditures' | 'credits';
export type QuarterPeriod = 'q1' | 'q2' | 'q3' | 'q4' | 'ytd';
export type ChartView = 'bar' | 'donut';

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
  readonly endDate?: string;
  readonly annualSalary: number;
  readonly confirmedSalary?: number;
  readonly hourlyRate: number;
  readonly ytdHours: number;
  readonly ytdCost: number;
  readonly color: string;
  readonly isSpecialEmployee?: boolean;
}

export interface SredProjectBar {
  readonly projectId: string;
  readonly projectName: string;
  readonly value: number;
  readonly isSredEligible: boolean;
  readonly color: string;
}

export interface EmployeeBreakdownBar {
  readonly employeeId: string;
  readonly name: string;
  readonly value: number;
  readonly color: string;
}

export interface StaffBarEntry {
  readonly employeeId: string;
  readonly name: string;
  readonly sredValue: number;
  readonly creditsValue: number;
  readonly unclaimedValue: number;
  readonly color: string;
}
