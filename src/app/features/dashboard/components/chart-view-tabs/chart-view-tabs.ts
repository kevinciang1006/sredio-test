import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChartView } from '../../models/chart-data.model';

@Component({
  selector: 'app-chart-view-tabs',
  imports: [],
  templateUrl: './chart-view-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartViewTabsComponent {
  readonly chartView = input<ChartView>('donut');
  readonly chartViewChange = output<ChartView>();

  select(next: ChartView): void {
    if (next !== this.chartView()) this.chartViewChange.emit(next);
  }
}
