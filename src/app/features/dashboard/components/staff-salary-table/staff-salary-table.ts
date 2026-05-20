import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeRow } from '../../models/chart-data.model';
import { ShortDatePipe } from '../../../../shared/pipes/short-date.pipe';
import { InfoTooltipComponent } from '../../../../shared/components/info-tooltip/info-tooltip';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar';

type SortKey = 'name' | 'hireDate' | 'endDate' | 'annualSalary' | 'confirmedSalary' | 'hourlyRate' | 'ytdHours';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-staff-salary-table',
  imports: [CurrencyPipe, DecimalPipe, ShortDatePipe, InfoTooltipComponent, AvatarComponent],
  templateUrl: './staff-salary-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffSalaryTableComponent {
  readonly rows = input.required<readonly EmployeeRow[]>();
  readonly isLoading = input(false);

  readonly isCollapsed = signal(true);
  readonly sortKey = signal<SortKey | null>(null);
  readonly sortDir = signal<SortDir>('asc');

  readonly sortedRows = computed<readonly EmployeeRow[]>(() => {
    const key = this.sortKey();
    if (!key) return this.rows();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.rows()].sort((a, b) => compareBy(a, b, key) * dir);
  });

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  setSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  arrow(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }
}

function compareBy(a: EmployeeRow, b: EmployeeRow, key: SortKey): number {
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av).localeCompare(String(bv));
}
