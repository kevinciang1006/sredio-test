import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

interface EChartsInstance {
  dispatchAction(action: unknown): void;
  on(event: string, handler: () => void): void;
}

interface PieEntry {
  readonly projectId: string;
  readonly name: string;
  readonly value: number;
  readonly color: string;
  readonly isRemainder: boolean;
  readonly isSredEligible: boolean;
}

@Component({
  selector: 'app-sred-projects-echarts',
  imports: [NgxEchartsDirective],
  templateUrl: './sred-projects-echarts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SredProjectsEchartsComponent {
  readonly bars = input.required<readonly SredProjectBar[]>();
  readonly mode = input<SredMode>('hours');
  readonly creditRate = input<number>(0.45);
  readonly projectClick = output<string>();

  readonly visibleBars = computed(() => this.bars().filter(b => b.value > 0));
  readonly total = computed(() => this.visibleBars().reduce((sum, b) => sum + b.value, 0));

  readonly pieEntries = computed<readonly PieEntry[]>(() => {
    const bars = this.visibleBars();
    const m = this.mode();

    if (m !== 'credits') {
      return bars.map(b => ({
        projectId: b.projectId,
        name: b.projectName,
        value: b.value,
        color: b.color,
        isRemainder: false,
        isSredEligible: b.isSredEligible,
      }));
    }

    const rate = Math.max(this.creditRate(), 0.001);
    const result: PieEntry[] = [];
    for (const b of bars) {
      if (!b.isSredEligible) {
        result.push({ projectId: b.projectId, name: b.projectName, value: b.value, color: b.color, isRemainder: false, isSredEligible: false });
      } else {
        result.push({ projectId: b.projectId, name: b.projectName, value: b.value, color: b.color, isRemainder: false, isSredEligible: true });
        result.push({ projectId: b.projectId, name: b.projectName, value: b.value * (1 - rate) / rate, color: b.color, isRemainder: true, isSredEligible: true });
      }
    }
    return result;
  });

  private echartsInstance: EChartsInstance | null = null;
  private selectedDataIndex = -1;

  readonly chartOption = computed(() => {
    const entries = this.pieEntries();
    const m = this.mode();

    const formatValue = (v: number) => m === 'hours'
      ? `${Math.round(v).toLocaleString('en-CA')} hrs`
      : CAD_FORMATTER.format(v);

    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: { dataIndex: number; name: string; value: number }) => {
          const entry = entries[params.dataIndex];
          if (!entry || entry.isRemainder) return '';
          const valueStr = formatValue(params.value);
          return entry.isSredEligible === false
            ? `${params.name}<br/>${valueStr}<br/><span style="font-size:11px;color:#9ca3af">Non-SR&amp;ED eligible</span>`
            : `${params.name}<br/>${valueStr}`;
        },
      },
      legend: { show: false },
      series: [{
        type: 'pie' as const,
        radius: '65%',
        center: ['50%', '45%'],
        label: {
          show: true,
          formatter: (params: { dataIndex: number; name: string; value: number }) => {
            const entry = entries[params.dataIndex];
            if (!entry || entry.isRemainder) return '';
            return `{name|${params.name}}\n{value|${formatValue(params.value)}}`;
          },
          rich: {
            name: { fontSize: 12, fontWeight: 'normal' as const, lineHeight: 20 },
            value: { fontSize: 13, fontWeight: 'bold' as const, lineHeight: 20 },
          },
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
        },
        data: entries.map(e => ({
          name: e.name,
          value: e.value,
          itemStyle: { color: e.color, opacity: e.isRemainder ? 0.3 : 1 },
          label: e.isRemainder ? { show: false } : {},
          labelLine: e.isRemainder ? { show: false } : {},
          emphasis: e.isRemainder ? { scale: false } : {},
        })),
      }],
    };
  });

  onChartInit(instance: unknown): void {
    this.echartsInstance = instance as EChartsInstance;

    this.echartsInstance.on('mouseout', () => {
      if (this.selectedDataIndex < 0) return;
      setTimeout(() => {
        this.echartsInstance?.dispatchAction({
          type: 'highlight', seriesIndex: 0, dataIndex: this.selectedDataIndex,
        });
      }, 50);
    });

    const entries = this.pieEntries();
    if (entries.length > 0) {
      this.selectedDataIndex = 0;
      setTimeout(() => {
        this.echartsInstance?.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: 0 });
        this.projectClick.emit(entries[0].projectId);
      }, 0);
    }
  }

  onChartClick(event: { dataIndex: number }): void {
    if (this.selectedDataIndex >= 0) {
      this.echartsInstance?.dispatchAction({
        type: 'downplay', seriesIndex: 0, dataIndex: this.selectedDataIndex,
      });
    }
    this.selectedDataIndex = event.dataIndex;
    this.echartsInstance?.dispatchAction({
      type: 'highlight', seriesIndex: 0, dataIndex: event.dataIndex,
    });
    const entry = this.pieEntries()[event.dataIndex];
    if (entry) this.projectClick.emit(entry.projectId);
  }
}
