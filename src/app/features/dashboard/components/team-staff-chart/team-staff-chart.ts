import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { StaffBarEntry } from '../../models/chart-data.model';

@Component({
  selector: 'app-team-staff-chart',
  imports: [NgApexchartsModule],
  templateUrl: './team-staff-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStaffChartComponent {
  readonly entries = input.required<readonly StaffBarEntry[]>();
  readonly employeeClick = output<string>();

  readonly series = computed(() => [
    { name: 'SR&ED', data: this.entries().map(e => Math.round(e.sredHours)) },
    { name: 'Unclaimed', data: this.entries().map(e => Math.round(e.unclaimedHours)) },
  ]);

  readonly chartOptions = computed(() => {
    const entries = this.entries();
    return {
      chart: {
        type: 'bar' as const,
        height: Math.max(180, entries.length * 60 + 80),
        width: '100%',
        redrawOnParentResize: true,
        toolbar: { show: false },
        events: {
          dataPointSelection: (
            _event: unknown,
            _ctx: unknown,
            config: { dataPointIndex: number },
          ) => {
            const entry = entries[config.dataPointIndex];
            if (entry) this.employeeClick.emit(entry.employeeId);
          },
        },
      } as ApexChart,
      plotOptions: {
        bar: { horizontal: false, columnWidth: '55%', borderRadius: 3 },
      } as ApexPlotOptions,
      dataLabels: { enabled: false } as ApexDataLabels,
      xaxis: {
        categories: entries.map(e => e.name),
        labels: { rotate: -30, style: { fontSize: '11px' } },
        title: { text: 'SR&ED Employees and Contractors' },
      } as ApexXAxis,
      yaxis: { title: { text: 'SR&ED Hours' } } as ApexYAxis,
      colors: ['#1e40af', '#9ca3af'],
      legend: { show: true, position: 'right' as const } as ApexLegend,
      tooltip: {
        y: { formatter: (v: number) => `${v.toFixed(0)} hrs` },
      } as ApexTooltip,
    };
  });
}
