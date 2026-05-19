export interface Employee {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hireDate: string;
  readonly annualSalary: number;
  readonly role: string;
  readonly endDate?: string;
  readonly confirmedSalary?: number;
  readonly isSpecialEmployee?: boolean;
  readonly teamId?: string;
}
