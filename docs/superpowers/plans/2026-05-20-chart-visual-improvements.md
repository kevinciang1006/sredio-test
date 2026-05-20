# Chart Visual Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make bar charts taller with more prominent value labels, and replace donut charts with solid pie charts that show values inside each slice, a bottom legend, and a scale+outline hover effect.

**Architecture:** Three independent HTML/TypeScript changes to four existing components. No new files, no calculation changes. Bar chart changes are template-only; pie chart changes replace the ApexCharts `donut` config with `pie` + `dataLabels` + component-scoped CSS for hover.

**Tech Stack:** Angular 21, ng-apexcharts, Tailwind CSS, inline SVG CSS via `styles` array

---

### Task 1: Bar chart height and label prominence

**Files:**
- Modify: `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html`
- Modify: `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html`

No TypeScript changes — purely template.

- [ ] **Step 1: Update `sred-projects-bar.html`**

Replace the entire file content with:

```html
@if (total() === 0) {
  <p class="text-sm text-gray-400 py-8 text-center">No data for this period.</p>
} @else {
  <div class="flex w-full h-24 rounded overflow-hidden gap-0.5">
    @for (bar of bars(); track bar.projectId) {
      @if (bar.value > 0) {
        <button
          type="button"
          [style.width]="widthPct(bar.value)"
          [style.background-color]="bar.color"
          [appTooltip]="tooltipFor(bar)"
          (click)="projectClick.emit(bar.projectId)"
          class="relative flex flex-col items-center justify-center overflow-hidden hover:opacity-90 transition-opacity cursor-pointer min-w-[80px] shrink">
          <span class="block w-full max-w-full truncate px-1 text-center leading-tight"
                style="font-size:9px; font-weight:400; letter-spacing:0.04em; text-transform:uppercase; color:rgba(255,255,255,0.8);">
            {{ bar.projectName }}
          </span>
          <span class="block w-full max-w-full truncate px-1 text-center"
                style="font-size:16px; font-weight:700; color:white; line-height:1.2;">
            @if (mode() === 'hours') {
              {{ bar.value | number:'1.0-0' }} hrs
            } @else {
              {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
            }
          </span>
        </button>
      }
    }
  </div>
  <p class="text-xs text-gray-400 mt-2 px-1">
    Gray = Unclaimed Work: hours on non-SR&amp;ED eligible projects (admin, operations, meetings, and other non-qualifying work).
  </p>
}
```

Key changes from current: `h-16` → `h-24` on the container div; removed `text-xs font-medium` from button class; name span gets inline `font-size:9px` uppercase style; value span gets inline `font-size:16px; font-weight:700` style.

- [ ] **Step 2: Update `employee-breakdown-bar.html`**

Replace the entire file content with:

```html
@if (total() === 0) {
  <p class="text-sm text-gray-400 py-4 text-center">No employee data for this project/period.</p>
} @else {
  <div class="flex w-full h-24 rounded overflow-hidden gap-0.5">
    @for (bar of bars(); track bar.employeeId) {
      <button
        type="button"
        [style.width]="widthPct(bar.value)"
        [style.background-color]="bar.color"
        [appTooltip]="tooltipFor(bar)"
        class="flex flex-col items-center justify-center overflow-hidden min-w-[80px] shrink cursor-default">
        <span class="block w-full max-w-full truncate px-1 text-center leading-tight"
              style="font-size:9px; font-weight:400; letter-spacing:0.04em; text-transform:uppercase; color:rgba(255,255,255,0.8);">
          {{ bar.name }}
        </span>
        <span class="block w-full max-w-full truncate px-1 text-center"
              style="font-size:16px; font-weight:700; color:white; line-height:1.2;">
          @if (mode() === 'hours') {
            {{ bar.value | number:'1.0-0' }} hrs
          } @else {
            {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
          }
        </span>
      </button>
    }
  </div>
}
```

Same changes as step 1: `h-16` → `h-24`, removed `text-xs font-medium` from button, name gets 9px uppercase style, value gets 16px bold style. Uses `bar.name` (not `bar.projectName`).

- [ ] **Step 3: Build check**

```bash
ng build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html \
        src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html
git commit -m "feat: taller bar charts with prominent value labels"
```

---

### Task 2: sred-projects-donut → solid pie with inside labels and hover

**Files:**
- Modify: `src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.ts`

The `.html` file does not need changes — it already binds `chartOptions().plotOptions`, `chartOptions().dataLabels`, etc.

- [ ] **Step 1: Replace `sred-projects-donut.ts`**

```ts
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
```

What changed vs the old file: `type: 'donut'` → `type: 'pie'`; entire `plotOptions.pie.donut` block replaced with `plotOptions: {} as ApexPlotOptions`; `dataLabels.enabled: false` replaced with `enabled: true` + `formatter` + `style` + `dropShadow`; `legend.position: 'right'` → `'bottom'` + `horizontalAlign: 'center'`; `styles` array added with hover CSS.

- [ ] **Step 2: Build check**

```bash
ng build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.ts
git commit -m "feat: sred-projects-donut → solid pie with inside labels and hover effect"
```

---

### Task 3: employee-breakdown-donut → solid pie with inside labels and hover

**Files:**
- Modify: `src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.ts`

The `.html` file does not need changes.

- [ ] **Step 1: Replace `employee-breakdown-donut.ts`**

```ts
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
```

What changed vs the old file: `type: 'donut'` → `type: 'pie'`; `plotOptions.pie.donut` block removed; `dataLabels` now enabled with formatter + style; `legend` moved to bottom center; `styles` array added with hover CSS. The `centerLabel` variable is removed (no longer needed without the donut center).

- [ ] **Step 2: Build check**

```bash
ng build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.ts
git commit -m "feat: employee-breakdown-donut → solid pie with inside labels and hover effect"
```

---

## Verification checklist

After all tasks complete:

1. `ng serve` and open the dashboard
2. SR&ED Projects bar: 96px tall, name is small uppercase, value is large bold (`1,204 hrs` / `$96,320`)
3. Employee breakdown bar (drill into a project): same tall treatment
4. SR&ED Projects pie: solid (no hole), values inside slices, legend centered at bottom with project names only
5. Switch mode (hours → cost): pie slice labels update to `$96,320`, bar values update — no TypeScript errors in console
6. Hover a pie slice: smooth scale-out + white outline; other slices stay normal
7. Click a pie slice: drill-down fires (project breakdown appears)
8. Employee breakdown pie (drilled view): solid pie, values inside, bottom legend, hover scale works
9. Tenant switch: all charts update correctly
