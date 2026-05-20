import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { EmployeeBreakdownBar, SredMode } from '../../models/chart-data.model';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-employee-breakdown-donut',
  imports: [NgApexchartsModule],
  templateUrl: './employee-breakdown-donut.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host ::ng-deep .apexcharts-pie-series path {
    transition: transform 200ms ease, stroke 200ms ease, stroke-width 200ms ease;
    transform-box: view-box;
    transform-origin: 50% 50%;
  }
  :host ::ng-deep .apexcharts-pie-series path:hover {
    transform: scale(1.10);
    stroke: white;
    stroke-width: 2px;
  }`],
})
export class EmployeeBreakdownDonutComponent {
  readonly bars = input.required<readonly EmployeeBreakdownBar[]>();
  readonly mode = input<SredMode>('hours');

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));
  readonly series = computed(() => this.bars().map(b => b.value));

  readonly chartOptions = computed(() => {
    const bars = this.bars();
    const m = this.mode();

    const tooltipFormatter = m === 'hours'
      ? (v: number) => `${Math.round(v).toLocaleString('en-CA')} hrs`
      : (v: number) => CAD_FORMATTER.format(v);

    return {
      chart: {
        type: 'pie' as const,
        height: 300,
        width: '100%',
        redrawOnParentResize: true,
        toolbar: { show: false },
      } as ApexChart,
      plotOptions: {} as ApexPlotOptions,
      dataLabels: {
        enabled: true,
        formatter: (_val: number, opts: { seriesIndex: number }) => {
          const raw = bars[opts.seriesIndex]?.value ?? 0;
          return m === 'hours'
            ? `${Math.round(raw).toLocaleString('en-CA')} hrs`
            : CAD_FORMATTER.format(raw);
        },
        style: {
          fontSize: '12px',
          fontWeight: '700',
          colors: ['#ffffff'],
        },
        dropShadow: { enabled: false },
      } as ApexDataLabels,
      labels: bars.map(b => b.name),
      colors: bars.map(b => b.color),
      legend: {
        show: true,
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
      } as ApexLegend,
      tooltip: {
        y: { formatter: tooltipFormatter },
      } as ApexTooltip,
    };
  });
}
