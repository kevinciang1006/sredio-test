export interface TimeEntry {
  readonly id: string;
  readonly employeeId: string;
  readonly projectId: string;
  readonly date: string;
  readonly hours: number;
}
