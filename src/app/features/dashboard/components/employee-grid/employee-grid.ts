import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeRow } from '../../models/chart-data.model';

type SortableCol = keyof Pick<
  EmployeeRow,
  'name' | 'hireDate' | 'annualSalary' | 'hourlyRate' | 'ytdHours' | 'ytdCost'
>;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-employee-grid',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './employee-grid.html',
  styleUrl: './employee-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeGridComponent {
  readonly rows = input.required<readonly EmployeeRow[]>();
  readonly isLoading = input(false);

  readonly sortCol = signal<SortableCol>('name');
  readonly sortDir = signal<SortDir>('asc');

  readonly sortedRows = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.rows()].sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  toggleSort(col: SortableCol): void {
    if (this.sortCol() === col) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  sortIndicator(col: SortableCol): string {
    if (this.sortCol() !== col) return '';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }
}
