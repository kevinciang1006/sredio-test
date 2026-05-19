import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeesPageRow, SortKey, SortDir } from '../models/employee-row';
import { ShortDatePipe } from '../../../shared/pipes/short-date.pipe';

@Component({
  selector: 'app-employees-table',
  imports: [CurrencyPipe, DecimalPipe, ShortDatePipe],
  templateUrl: './employees-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesTableComponent {
  readonly rows = input.required<readonly EmployeesPageRow[]>();
  readonly sortKey = input<SortKey | null>(null);
  readonly sortDir = input<SortDir>('asc');
  readonly sort = output<SortKey>();
  readonly rowClick = output<string>();

  arrow(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }
}
