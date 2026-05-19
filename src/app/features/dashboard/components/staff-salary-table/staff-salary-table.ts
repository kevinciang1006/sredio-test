import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeRow } from '../../models/chart-data.model';
import { ShortDatePipe } from '../../../../shared/pipes/short-date.pipe';

@Component({
  selector: 'app-staff-salary-table',
  imports: [CurrencyPipe, DecimalPipe, ShortDatePipe],
  templateUrl: './staff-salary-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffSalaryTableComponent {
  readonly rows = input.required<readonly EmployeeRow[]>();
  readonly isLoading = input(false);

  readonly isCollapsed = signal(false);

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }
}
