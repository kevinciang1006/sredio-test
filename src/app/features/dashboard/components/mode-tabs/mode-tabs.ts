import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SredMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-mode-tabs',
  imports: [],
  templateUrl: './mode-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeTabsComponent {
  readonly mode = input<SredMode>('hours');
  readonly modeChange = output<SredMode>();

  readonly tabs: readonly { value: SredMode; label: string }[] = [
    { value: 'hours', label: 'Show Hours' },
    { value: 'expenditures', label: 'Show Expenditures' },
    { value: 'credits', label: 'Show Credits' },
  ];

  select(next: SredMode): void {
    if (next !== this.mode()) this.modeChange.emit(next);
  }
}
