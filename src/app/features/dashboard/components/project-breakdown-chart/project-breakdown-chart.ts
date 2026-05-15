import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexTooltip,
  ApexFill,
} from 'ng-apexcharts';
import { ChartMode, ProjectBreakdownData } from '../../models/chart-data.model';

@Component({
  selector: 'app-project-breakdown-chart',
  imports: [NgApexchartsModule],
  templateUrl: './project-breakdown-chart.html',
  styleUrl: './project-breakdown-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectBreakdownChartComponent {
  readonly data = input.required<ProjectBreakdownData>();
  readonly mode = input.required<ChartMode>();
  readonly isLoading = input(false);

  readonly series = computed<ApexAxisChartSeries>(() =>
    this.data().series.map(s => ({ name: s.name, data: [...s.data] })),
  );

  readonly chartOptions = computed(() => ({
    chart: {
      type: 'bar' as const,
      stacked: true,
      height: 360,
      toolbar: { show: false },
    } as ApexChart,
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
    } as ApexPlotOptions,
    dataLabels: { enabled: false } as ApexDataLabels,
    xaxis: { categories: [...this.data().categories] } as ApexXAxis,
    yaxis: {
      title: { text: this.mode() === 'hours' ? 'Hours' : 'Cost (CAD)' },
      labels: {
        formatter: (v: number) =>
          this.mode() === 'cost'
            ? `$${Math.round(v).toLocaleString('en-CA')}`
            : v.toLocaleString('en-CA'),
      },
    } as ApexYAxis,
    legend: { position: 'bottom' as const } as ApexLegend,
    tooltip: {
      y: {
        formatter: (v: number) =>
          this.mode() === 'cost'
            ? `$${Math.round(v).toLocaleString('en-CA')}`
            : `${v.toLocaleString('en-CA')} hrs`,
      },
    } as ApexTooltip,
    fill: { opacity: 0.92 } as ApexFill,
  }));
}
