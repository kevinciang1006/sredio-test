import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-sred-projects-bar',
  imports: [CurrencyPipe, DecimalPipe, TooltipDirective],
  templateUrl: './sred-projects-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`.bar-btn {
    transition: transform 200ms ease, filter 200ms ease;
  }
  .bar-btn:hover {
    transform: scale(1.05);
    filter: brightness(1.10);
    outline: 3px solid rgba(255,255,255,0.85);
    outline-offset: -2px;
    position: relative;
    z-index: 1;
  }`],
})
export class SredProjectsBarComponent {
  readonly bars = input.required<readonly SredProjectBar[]>();
  readonly mode = input<SredMode>('hours');
  readonly projectClick = output<string>();

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));
  readonly visibleBars = computed(() => this.bars().filter(b => b.value > 0));

  widthPct(value: number): string {
    const t = this.total();
    return t === 0 ? '0%' : `${((value / t) * 100).toFixed(2)}%`;
  }

  tooltipFor(bar: SredProjectBar): string {
    const valueStr = this.mode() === 'hours'
      ? `${Math.round(bar.value).toLocaleString('en-CA')} hrs`
      : CAD_FORMATTER.format(bar.value);
    const base = `${bar.projectName} — ${valueStr}`;
    return bar.isSredEligible
      ? base
      : `${base}\nNon-SR&ED eligible: hours on admin, operations, and other work that does not qualify for the SR&ED claim.`;
  }
}
