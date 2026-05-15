import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChartMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-hours-cost-toggle',
  imports: [],
  templateUrl: './hours-cost-toggle.html',
  styleUrl: './hours-cost-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoursCostToggleComponent {
  readonly mode = input<ChartMode>('hours');
  readonly modeChange = output<ChartMode>();

  select(next: ChartMode): void {
    if (next !== this.mode()) this.modeChange.emit(next);
  }
}
