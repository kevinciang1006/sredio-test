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
import { SredMode, StaffBarEntry } from '../../models/chart-data.model';

@Component({
  selector: 'app-team-staff-chart',
  imports: [NgApexchartsModule],
  templateUrl: './team-staff-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStaffChartComponent {
  readonly entries = input.required<readonly StaffBarEntry[]>();
  readonly mode = input<SredMode>('hours');
  readonly employeeClick = output<string>();

  readonly series = computed(() => {
    const m = this.mode();
    const sred = {
      name: m === 'credits' ? 'SR&ED Credits' : 'SR&ED',
      data: this.entries().map(e => Math.round(e.sredValue)),
    };
    if (m === 'credits') return [sred];
    return [sred, { name: 'Unclaimed', data: this.entries().map(e => Math.round(e.unclaimedValue)) }];
  });

  readonly chartOptions = computed(() => {
    const entries = this.entries();
    const m = this.mode();

    const yAxisTitle =
      m === 'hours' ? 'SR&ED Hours' :
      m === 'expenditures' ? 'Expenditures ($)' :
      'SR&ED Credits ($)';

    const tooltipFormatter =
      m === 'hours'
        ? (v: number) => `${v.toFixed(0)} hrs`
        : (v: number) => `$${v.toLocaleString()}`;

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
      yaxis: { title: { text: yAxisTitle } } as ApexYAxis,
      colors: ['#1e40af', '#9ca3af'],
      legend: { show: true, position: 'right' as const } as ApexLegend,
      tooltip: {
        y: { formatter: tooltipFormatter },
      } as ApexTooltip,
    };
  });
}
