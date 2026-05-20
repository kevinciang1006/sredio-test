import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EmployeeBreakdownBar, SredMode } from '../../models/chart-data.model';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

const REMAINDER_COLOR = '#e5e7eb';

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function monoShades(hex: string, count: number): string[] {
  const [h, s] = hexToHsl(hex);
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const l = 35 + t * 35; // 35% (dark) → 70% (light)
    return `hsl(${h},${s}%,${l.toFixed(0)}%)`;
  });
}

interface Slice {
  readonly name: string;
  readonly value: number;
  readonly color: string;
  readonly isRemainder: boolean;
}

@Component({
  selector: 'app-employee-breakdown-echarts',
  imports: [NgxEchartsDirective],
  templateUrl: './employee-breakdown-echarts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeBreakdownEchartsComponent {
  readonly bars = input.required<readonly EmployeeBreakdownBar[]>();
  readonly mode = input<SredMode>('hours');
  readonly creditRate = input<number>(0.45);
  /** When provided, slices use monochromatic shades of this hex color instead of per-employee colors. */
  readonly projectColor = input<string>('');

  readonly total = computed(() => this.bars().reduce((sum, b) => sum + b.value, 0));

  readonly chartOption = computed(() => {
    const bars = this.bars();
    const m = this.mode();
    const projColor = this.projectColor();
    const rate = Math.max(this.creditRate(), 0.001);
    const colors = projColor ? monoShades(projColor, bars.length) : bars.map(b => b.color);

    const formatValue = (v: number) => m === 'hours'
      ? `${Math.round(v).toLocaleString('en-CA')} hrs`
      : CAD_FORMATTER.format(v);

    const slices: Slice[] = [];
    if (m === 'credits') {
      bars.forEach((b, i) => {
        slices.push({ name: b.name, value: b.value, color: colors[i], isRemainder: false });
        slices.push({ name: b.name, value: b.value * (1 - rate) / rate, color: REMAINDER_COLOR, isRemainder: true });
      });
    } else {
      bars.forEach((b, i) => {
        slices.push({ name: b.name, value: b.value, color: colors[i], isRemainder: false });
      });
    }

    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: { dataIndex: number; name: string; value: number }) => {
          const slice = slices[params.dataIndex];
          if (!slice || slice.isRemainder) return '';
          return `${params.name}<br/>${formatValue(params.value)}`;
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
            const slice = slices[params.dataIndex];
            if (!slice || slice.isRemainder) return '';
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
        data: slices.map(s => ({
          name: s.name,
          value: s.value,
          itemStyle: { color: s.color },
          label: s.isRemainder ? { show: false } : {},
          labelLine: s.isRemainder ? { show: false } : {},
          emphasis: s.isRemainder ? { scale: false } : {},
        })),
      }],
    };
  });
}
