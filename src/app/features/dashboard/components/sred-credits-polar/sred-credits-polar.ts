import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { SredProjectBar } from '../../models/chart-data.model';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-sred-credits-polar',
  imports: [NgxEchartsDirective],
  templateUrl: './sred-credits-polar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SredCreditsPolarComponent {
  readonly bars = input.required<readonly SredProjectBar[]>();
  readonly creditRate = input<number>(0.45);
  readonly projectClick = output<string>();

  readonly visibleBars = computed(() => this.bars().filter(b => b.value > 0));
  readonly total = computed(() => this.visibleBars().reduce((s, b) => s + b.value, 0));

  readonly chartOption = computed(() => {
    const bars = this.visibleBars();
    const rate = Math.max(this.creditRate(), 0.01);
    const totalExpenditure = bars.reduce((s, b) => s + b.value / rate, 0);

    return {
      polar: { radius: ['15%', '80%'] },
      angleAxis: {
        max: totalExpenditure,
        startAngle: 90,
        show: false,
      },
      radiusAxis: {
        type: 'category' as const,
        data: bars.map(b => b.projectName),
        axisLabel: { fontSize: 11, color: '#374151', interval: 0 },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
      },
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: { dataIndex: number; seriesName: string }) => {
          const bar = bars[params.dataIndex];
          if (!bar) return '';
          const exp = bar.value / rate;
          return params.seriesName === 'Remainder'
            ? `${bar.projectName}<br/>Expenditure: ${CAD_FORMATTER.format(exp)}`
            : `${bar.projectName}<br/>Credits: ${CAD_FORMATTER.format(bar.value)}<br/>Expenditure: ${CAD_FORMATTER.format(exp)}`;
        },
      },
      series: [
        {
          type: 'bar' as const,
          coordinateSystem: 'polar' as const,
          stack: 'total',
          name: 'Credits',
          data: bars.map(b => ({
            value: b.value,
            itemStyle: { color: b.color },
          })),
          label: {
            show: true,
            position: 'insideStart' as const,
            formatter: (params: { value: number }) => CAD_FORMATTER.format(params.value),
            color: '#fff',
            fontWeight: 'bold' as const,
            fontSize: 11,
          },
        },
        {
          type: 'bar' as const,
          coordinateSystem: 'polar' as const,
          stack: 'total',
          name: 'Remainder',
          data: bars.map(b => ({
            value: b.value * (1 - rate) / rate,
            itemStyle: { color: b.color, opacity: 0.3 },
          })),
          label: { show: false },
        },
      ],
    };
  });

  onChartInit(_instance: unknown): void {
    const bars = this.visibleBars();
    if (bars.length > 0) {
      setTimeout(() => this.projectClick.emit(bars[0].projectId), 0);
    }
  }

  onChartClick(event: { dataIndex: number }): void {
    const bar = this.visibleBars()[event.dataIndex];
    if (bar) this.projectClick.emit(bar.projectId);
  }
}
