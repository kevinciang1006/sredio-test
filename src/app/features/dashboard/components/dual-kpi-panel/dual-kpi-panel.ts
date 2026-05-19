import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { QuarterPeriod, SredMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-dual-kpi-panel',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dual-kpi-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DualKpiPanelComponent {
  readonly currentValue = input.required<number>();
  readonly projectedValue = input<number | null>(null);
  readonly mode = input<SredMode>('hours');
  readonly selectedPeriod = input<QuarterPeriod>('ytd');
  readonly isLoading = input(false);

  readonly showProjection = computed(
    () => this.selectedPeriod() === 'ytd' && this.projectedValue() !== null,
  );

  readonly periodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'ytd': return 'Current Year to Date SR&ED';
      case 'q1': return 'Q1 SR&ED';
      case 'q2': return 'Q2 SR&ED';
      case 'q3': return 'Q3 SR&ED';
      case 'q4': return 'Q4 SR&ED';
    }
  });
}
