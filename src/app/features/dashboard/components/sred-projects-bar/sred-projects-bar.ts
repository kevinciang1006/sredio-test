import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';

@Component({
  selector: 'app-sred-projects-bar',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './sred-projects-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SredProjectsBarComponent {
  readonly bars = input.required<readonly SredProjectBar[]>();
  readonly mode = input<SredMode>('hours');
  readonly projectClick = output<string>();

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));

  widthPct(value: number): string {
    const t = this.total();
    return t === 0 ? '0%' : `${((value / t) * 100).toFixed(2)}%`;
  }
}
