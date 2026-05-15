import { Employee } from '../../../core/models/employee.model';

export interface Profile extends Employee {
  readonly avatarUrl?: string;
}
