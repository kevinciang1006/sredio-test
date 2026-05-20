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

    const tooltipFormatter = (v: number, opts: { dataPointIndex: number }) => {
      const valueStr = m === 'hours'
        ? `${Math.round(v).toLocaleString('en-CA')} hrs`
        : CAD_FORMATTER.format(v);
      const bar = bars[opts?.dataPointIndex];
      return bar?.isSredEligible === false
        ? `${valueStr}\nNon-SR&ED eligible: hours on admin, operations, and other work that does not qualify for the SR&ED claim.`
        : valueStr;
    };

    return {
      chart: {
        type: 'pie' as const,
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
      labels: bars.map(b => b.projectName),
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
