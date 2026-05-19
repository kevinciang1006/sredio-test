import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-sred-projects-donut',
  imports: [NgApexchartsModule],
  templateUrl: './sred-projects-donut.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SredProjectsDonutComponent {
  readonly bars = input.required<readonly SredProjectBar[]>();
  readonly mode = input<SredMode>('hours');
  readonly projectClick = output<string>();

  readonly visibleBars = computed(() => this.bars().filter(b => b.value > 0));
  readonly total = computed(() => this.visibleBars().reduce((sum, b) => sum + b.value, 0));
  readonly series = computed(() => this.visibleBars().map(b => b.value));

  readonly chartOptions = computed(() => {
    const bars = this.visibleBars();
    const m = this.mode();
    const total = this.total();

    const centerLabel = m === 'hours'
      ? `${Math.round(total).toLocaleString('en-CA')} hrs`
      : CAD_FORMATTER.format(total);

    const tooltipFormatter = m === 'hours'
      ? (v: number) => `${Math.round(v).toLocaleString('en-CA')} hrs`
      : (v: number) => CAD_FORMATTER.format(v);

    return {
      chart: {
        type: 'donut' as const,
        height: 300,
        width: '100%',
        redrawOnParentResize: true,
        toolbar: { show: false },
        events: {
          dataPointSelection: (
            _event: unknown,
            _ctx: unknown,
            config: { dataPointIndex: number },
          ) => {
            const bar = bars[config.dataPointIndex];
            if (bar) this.projectClick.emit(bar.projectId);
          },
        },
      } as ApexChart,
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                formatter: () => centerLabel,
              },
            },
          },
        },
      } as ApexPlotOptions,
      dataLabels: {
        enabled: true,
        formatter: (val: string | number | number[]) => `${Number(val).toFixed(1)}%`,
      } as ApexDataLabels,
      labels: bars.map(b => b.projectName),
      colors: bars.map(b => b.color),
      legend: { show: true, position: 'bottom' as const } as ApexLegend,
      tooltip: {
        y: { formatter: tooltipFormatter },
      } as ApexTooltip,
    };
  });
}
