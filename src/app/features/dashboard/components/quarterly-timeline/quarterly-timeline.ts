import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { QuarterPeriod, SredMode } from '../../models/chart-data.model';

export interface QuarterTab {
  readonly period: QuarterPeriod;
  readonly label: string;
  readonly sublabel: string;
  readonly value: number;
}

@Component({
  selector: 'app-quarterly-timeline',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './quarterly-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterlyTimelineComponent {
  readonly tabs = input.required<readonly QuarterTab[]>();
  readonly selected = input<QuarterPeriod>('ytd');
  readonly mode = input<SredMode>('hours');
  readonly periodSelect = output<QuarterPeriod>();

  select(period: QuarterPeriod): void {
    if (period !== this.selected()) this.periodSelect.emit(period);
  }
}
