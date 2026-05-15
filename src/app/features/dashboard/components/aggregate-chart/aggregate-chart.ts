import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexXAxis,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { AggregateData, ChartMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-aggregate-chart',
  imports: [NgApexchartsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './aggregate-chart.html',
  styleUrl: './aggregate-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregateChartComponent {
  readonly data = input.required<AggregateData>();
  readonly mode = input.required<ChartMode>();
  readonly isLoading = input(false);

  readonly series = computed<ApexAxisChartSeries>(() => [
    {
      name: this.mode() === 'hours' ? 'Hours' : 'Cost',
      data: this.data().data.map(d => d.value),
    },
  ]);

  readonly chartOptions = computed(() => ({
    chart: {
      type: 'bar' as const,
      height: 320,
      toolbar: { show: false },
    } as ApexChart,
    plotOptions: {
      bar: { horizontal: true, barHeight: '55%', borderRadius: 4 },
    } as ApexPlotOptions,
    dataLabels: { enabled: false } as ApexDataLabels,
    xaxis: {
      categories: this.data().data.map(d => d.project),
      labels: {
        formatter: (v: string) => {
          const n = Number(v);
          if (Number.isNaN(n)) return v;
          return this.mode() === 'cost'
            ? `$${Math.round(n).toLocaleString('en-CA')}`
            : n.toLocaleString('en-CA');
        },
      },
    } as ApexXAxis,
    legend: { show: false } as ApexLegend,
    colors: ['#2563eb'],
    tooltip: {
      y: {
        formatter: (v: number) =>
          this.mode() === 'cost'
            ? `$${Math.round(v).toLocaleString('en-CA')}`
            : `${v.toLocaleString('en-CA')} hrs`,
      },
    } as ApexTooltip,
  }));
}
