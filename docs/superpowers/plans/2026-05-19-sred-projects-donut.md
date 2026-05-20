# SR&ED Projects Donut View — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Donut chart alternative to the SR&ED Projects section, toggleable via a "Bar | Donut" tab in the section header, with the donut drilldown staying in donut mode (employee donut instead of employee bar).

**Architecture:** Two new standalone ApexCharts donut components mirror the existing bar components exactly — same inputs, same data, different renderer. A single `chartView` signal in `DashboardComponent` drives which component pair is rendered. No new calculations, no model changes.

**Tech Stack:** Angular 21 signals, `ng-apexcharts` (`NgApexchartsModule`, already a project dependency), Tailwind CSS.

---

## File map

| Action | Path | Responsibility |
|---|---|---|
| CREATE | `components/sred-projects-donut/sred-projects-donut.ts` | Donut chart for top-level SR&ED projects |
| CREATE | `components/sred-projects-donut/sred-projects-donut.html` | Template for above |
| CREATE | `components/employee-breakdown-donut/employee-breakdown-donut.ts` | Donut chart for drilled employee view |
| CREATE | `components/employee-breakdown-donut/employee-breakdown-donut.html` | Template for above |
| MODIFY | `dashboard.ts` | Add `chartView` signal + handler + new component imports |
| MODIFY | `dashboard.html` | Add Bar/Donut toggle to header + conditional chart rendering |

All paths are relative to `src/app/features/dashboard/`.

---

## Task 1: Create `sred-projects-donut` component

**Files:**
- Create: `src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.ts`
- Create: `src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.html`

> No calculation logic → no unit test. Component tests are nice-to-have per CLAUDE.md.

- [ ] **Step 1: Create the TypeScript file**

```typescript
// src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.ts
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
        formatter: (val: number) => `${val.toFixed(1)}%`,
      } as ApexDataLabels,
      labels: bars.map(b => b.projectName),
      colors: bars.map(b => b.color),
      legend: { show: true, position: 'bottom' as const } as ApexLegend,
      tooltip: {
        y: { formatter: tooltipFormatter },
      } as ApexTooltip,
    };
  });
}
```

- [ ] **Step 2: Create the HTML template**

```html
<!-- src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.html -->
@if (total() === 0) {
  <p class="text-sm text-gray-400 py-8 text-center">No data for this period.</p>
} @else {
  <apx-chart
    class="block w-full"
    [series]="series()"
    [chart]="chartOptions().chart"
    [plotOptions]="chartOptions().plotOptions"
    [dataLabels]="chartOptions().dataLabels"
    [labels]="chartOptions().labels"
    [colors]="chartOptions().colors"
    [legend]="chartOptions().legend"
    [tooltip]="chartOptions().tooltip" />
  <p class="text-xs text-gray-400 mt-2 px-1">
    Gray = Unclaimed Work: hours on non-SR&amp;ED eligible projects (admin, operations, meetings, and other non-qualifying work).
  </p>
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Commit**

```bash
git add src/app/features/dashboard/components/sred-projects-donut/
git commit -m "feat: add sred-projects-donut component"
```

---

## Task 2: Create `employee-breakdown-donut` component

**Files:**
- Create: `src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.ts`
- Create: `src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.html`

- [ ] **Step 1: Create the TypeScript file**

```typescript
// src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.ts
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
        formatter: (val: number) => `${val.toFixed(1)}%`,
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
```

- [ ] **Step 2: Create the HTML template**

```html
<!-- src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.html -->
@if (total() === 0) {
  <p class="text-sm text-gray-400 py-4 text-center">No employee data for this project/period.</p>
} @else {
  <apx-chart
    class="block w-full"
    [series]="series()"
    [chart]="chartOptions().chart"
    [plotOptions]="chartOptions().plotOptions"
    [dataLabels]="chartOptions().dataLabels"
    [labels]="chartOptions().labels"
    [colors]="chartOptions().colors"
    [legend]="chartOptions().legend"
    [tooltip]="chartOptions().tooltip" />
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Commit**

```bash
git add src/app/features/dashboard/components/employee-breakdown-donut/
git commit -m "feat: add employee-breakdown-donut component"
```

---

## Task 3: Wire up dashboard

**Files:**
- Modify: `src/app/features/dashboard/dashboard.ts`
- Modify: `src/app/features/dashboard/dashboard.html`

- [ ] **Step 1: Add imports and `chartView` signal to `dashboard.ts`**

Add the two new component imports at the top of the file alongside the other component imports:

```typescript
import { SredProjectsDonutComponent } from './components/sred-projects-donut/sred-projects-donut';
import { EmployeeBreakdownDonutComponent } from './components/employee-breakdown-donut/employee-breakdown-donut';
```

Add both to the `imports` array in `@Component`:

```typescript
imports: [
  ModeTabsComponent,
  QuarterlyTimelineComponent,
  DualKpiPanelComponent,
  SredProjectsBarComponent,
  SredProjectsDonutComponent,       // ← add
  EmployeeBreakdownBarComponent,
  EmployeeBreakdownDonutComponent,   // ← add
  StaffSectionComponent,
  EmployeeModalComponent,
  StaffSalaryTableComponent,
  InfoTooltipComponent,
  PageHeaderComponent,
  CurrencyPipe,
  DecimalPipe,
],
```

Add the signal and handler anywhere in the class body (after the existing signals, before or after `onModeChange`):

```typescript
readonly chartView = signal<'bar' | 'donut'>('bar');

onChartViewChange(v: 'bar' | 'donut'): void {
  this.chartView.set(v);
}
```

- [ ] **Step 2: Update the SR&ED Projects section header in `dashboard.html`**

Replace the existing header `<div class="flex items-center gap-2 mb-4">` block (lines ~91–118) with the version below. The only addition is the `@if (!drilledProject())` toggle group flush to the right:

```html
<div class="flex items-center gap-2 mb-4">
  @if (drilledProject()) {
    <button
      type="button"
      (click)="onDrillBack()"
      class="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  }
  <h2 class="text-base font-semibold text-gray-900 inline-flex items-center gap-1.5">
    SR&amp;ED Projects
    <app-info-tooltip text="Each project's contribution to the SR&ED total for the selected period. Click a segment to drill into employee contributions. The gray 'Unclaimed Work' bar represents hours on non-SR&ED eligible projects — admin tasks, meetings, maintenance, and other work that doesn't qualify for the claim." />
  </h2>
  @if (drilledProject()) {
    <span class="text-sm text-gray-500">/ {{ drilledProject()!.name }}</span>
    @if (drilledProjectValue() !== null) {
      <span class="text-sm font-semibold text-gray-700 ml-1">
        @if (mode() === 'hours') {
          {{ drilledProjectValue()! | number:'1.0-0' }} hrs
        } @else {
          {{ drilledProjectValue()! | currency:'CAD':'symbol-narrow':'1.0-0' }}
        }
      </span>
    }
  }
  @if (!drilledProject()) {
    <div class="ml-auto flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
      <button
        type="button"
        (click)="onChartViewChange('bar')"
        [class.bg-blue-600]="chartView() === 'bar'"
        [class.text-white]="chartView() === 'bar'"
        [class.text-gray-700]="chartView() !== 'bar'"
        class="px-3 py-1 text-xs font-medium rounded-md transition-colors">
        Bar
      </button>
      <button
        type="button"
        (click)="onChartViewChange('donut')"
        [class.bg-blue-600]="chartView() === 'donut'"
        [class.text-white]="chartView() === 'donut'"
        [class.text-gray-700]="chartView() !== 'donut'"
        class="px-3 py-1 text-xs font-medium rounded-md transition-colors">
        Donut
      </button>
    </div>
  }
</div>
```

- [ ] **Step 3: Replace the chart rendering block in `dashboard.html`**

Replace the `@if (isLoading()) … @else if (drilledProject()) … @else …` block (lines ~120–128) with:

```html
@if (isLoading()) {
  <div class="h-16 animate-pulse bg-gray-100 rounded"></div>
} @else if (drilledProject()) {
  @if (chartView() === 'bar') {
    <app-employee-breakdown-bar
      [bars]="employeeBreakdownBars()"
      [mode]="mode()" />
  } @else {
    <app-employee-breakdown-donut
      [bars]="employeeBreakdownBars()"
      [mode]="mode()" />
  }
} @else {
  @if (chartView() === 'bar') {
    <app-sred-projects-bar
      [bars]="projectBars()"
      [mode]="mode()"
      (projectClick)="onProjectClick($event)" />
  } @else {
    <app-sred-projects-donut
      [bars]="projectBars()"
      [mode]="mode()"
      (projectClick)="onProjectClick($event)" />
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 5: Smoke-test in the browser**

Start the dev server if not already running:
```bash
ng serve
```

Check all of these:
1. Dashboard loads with "Bar" tab active — existing bar chart shows as before
2. Click "Donut" tab → donut chart appears with project slices, total in center
3. Click a donut slice → drills in, header shows breadcrumb, toggle disappears, employee donut renders
4. Click the back arrow → returns to donut project view
5. Click "Bar" tab → switches back to bar chart
6. Switch to Expenditures mode → donut center label and tooltip show CAD amounts
7. Switch to Credits mode → donut center label and tooltip show CAD amounts
8. Switch claim period to 2025 → donut still renders correctly

- [ ] **Step 6: Commit**

```bash
git add src/app/features/dashboard/dashboard.ts src/app/features/dashboard/dashboard.html
git commit -m "feat: wire Bar/Donut toggle in SR&ED Projects section"
```
