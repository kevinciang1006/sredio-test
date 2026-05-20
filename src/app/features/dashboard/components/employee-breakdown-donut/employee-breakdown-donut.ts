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

const EMPLOYEE_COLORS = [
  '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#be185d', '#0369a1',
];

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-employee-breakdown-donut',
  imports: [NgApexchartsModule],
  templateUrl: './employee-breakdown-donut.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeBreakdownDonutComponent {
  readonly bars = input.required<readonly EmployeeBreakdownBar[]>();
  readonly mode = input<SredMode>('hours');

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));
  readonly series = computed(() => this.bars().map(b => b.value));

  readonly chartOptions = computed(() => {
    const bars = this.bars();
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
      labels: bars.map(b => b.name),
      colors: bars.map((_, i) => EMPLOYEE_COLORS[i % EMPLOYEE_COLORS.length]),
      legend: { show: true, position: 'bottom' as const } as ApexLegend,
      tooltip: {
        y: { formatter: tooltipFormatter },
      } as ApexTooltip,
    };
  });
}
