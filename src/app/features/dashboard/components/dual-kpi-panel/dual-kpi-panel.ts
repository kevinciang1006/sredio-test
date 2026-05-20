import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { QuarterPeriod, SredMode } from '../../models/chart-data.model';
import { InfoTooltipComponent } from '../../../../shared/components/info-tooltip/info-tooltip';

@Component({
  selector: 'app-dual-kpi-panel',
  imports: [CurrencyPipe, DecimalPipe, InfoTooltipComponent],
  templateUrl: './dual-kpi-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DualKpiPanelComponent {
  readonly currentValue = input.required<number>();
  readonly projectedValue = input<number | null>(null);
  readonly mode = input<SredMode>('hours');
  readonly selectedPeriod = input<QuarterPeriod>('ytd');
  readonly isLoading = input(false);

  readonly showProjection = computed(() => this.projectedValue() !== null);

  readonly periodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'ytd': return 'Current Year to Date SR&ED';
      case 'q1': return 'Q1 SR&ED';
      case 'q2': return 'Q2 SR&ED';
      case 'q3': return 'Q3 SR&ED';
      case 'q4': return 'Q4 SR&ED';
    }
  });

  readonly currentTooltip = computed(() => {
    const period = this.selectedPeriod();
    const periodText = period === 'ytd' ? 'year-to-date' : period.toUpperCase();
    return `Your ${periodText} SR&ED total based on tracked time entries in the selected mode (hours, expenditures, or credits).`;
  });

  readonly projectedTooltip =
    'Full year forecast based on your current YTD pace.\n\nFormula: (YTD total ÷ days elapsed) × 365\n\nExample: 432 hrs in 139 days = 3.1 hrs/day → projected 1,132 hrs for the full year. Assumes Q3 and Q4 continue at the same rate as Q1–Q2.\n\nFor completed claim years (2024, 2025), the projection equals the actual YTD total — no extrapolation needed.';
}
