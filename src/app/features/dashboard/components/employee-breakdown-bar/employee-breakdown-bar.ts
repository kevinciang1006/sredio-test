import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeBreakdownBar, SredMode } from '../../models/chart-data.model';

const EMPLOYEE_COLORS = [
  '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#be185d', '#0369a1',
];

@Component({
  selector: 'app-employee-breakdown-bar',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './employee-breakdown-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeBreakdownBarComponent {
  readonly bars = input.required<readonly EmployeeBreakdownBar[]>();
  readonly mode = input<SredMode>('hours');

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));

  widthPct(value: number): string {
    const t = this.total();
    return t === 0 ? '0%' : `${((value / t) * 100).toFixed(2)}%`;
  }

  colorFor(index: number): string {
    return EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
  }
}
