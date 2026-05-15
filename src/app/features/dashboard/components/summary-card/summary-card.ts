import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

export type CardFormat = 'currency' | 'number';
export type CardTone = 'neutral' | 'projected';

@Component({
  selector: 'app-summary-card',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly format = input<CardFormat>('number');
  readonly tone = input<CardTone>('neutral');
  readonly isLoading = input(false);

  readonly toneClasses = computed(() =>
    this.tone() === 'projected'
      ? 'bg-white rounded-lg shadow-sm border border-gray-200 p-5 border-l-4 border-l-blue-500'
      : 'bg-white rounded-lg shadow-sm border border-gray-200 p-5 border-l-4 border-l-gray-300',
  );
}
