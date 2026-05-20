import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeBreakdownBar, SredMode } from '../../models/chart-data.model';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-employee-breakdown-bar',
  imports: [CurrencyPipe, DecimalPipe, TooltipDirective],
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

  tooltipFor(bar: EmployeeBreakdownBar): string {
    const valueStr = this.mode() === 'hours'
      ? `${Math.round(bar.value).toLocaleString('en-CA')} hrs`
      : CAD_FORMATTER.format(bar.value);
    return `${bar.name} — ${valueStr}`;
  }
}
