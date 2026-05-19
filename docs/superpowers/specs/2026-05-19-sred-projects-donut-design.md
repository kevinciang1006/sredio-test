# SR&ED Projects Donut View — Design Spec

**Date:** 2026-05-19
**Status:** Approved

## Overview

Add a Donut chart as an alternative view for the SR&ED Projects section. The existing horizontal segmented bar remains the default. A `Bar | Donut` tab toggle in the section header switches between them. The donut supports the same click-to-drilldown as the bar, but instead of the employee breakdown bar, it renders an employee donut — keeping the visual mode consistent throughout.

---

## Decisions

| Question | Decision |
|---|---|
| Chart type | Donut (ApexCharts `type: 'donut'`) |
| Toggle placement | Tab labels "Bar \| Donut" in the SR&ED Projects section header, right-aligned, matching existing `mode-tabs` pill style |
| Drilldown in donut mode | Clicking a project slice shows an employee donut (not the employee bar) |
| Default view | Bar (existing behaviour unchanged on load) |

---

## Components

### 1. `sred-projects-donut` (new)

**Location:** `src/app/features/dashboard/components/sred-projects-donut/`

**Inputs:**
- `bars: input.required<readonly SredProjectBar[]>()` — same model as `sred-projects-bar`
- `mode: input<SredMode>('hours')`

**Outputs:**
- `projectClick: output<string>()` — emits `projectId` on slice click

**Behaviour:**
- Renders an `ng-apexcharts` donut chart
- `series` = `bars().map(b => b.value)` (values only, no zero-value bars)
- `labels` = `bars().map(b => b.projectName)`
- `colors` = `bars().map(b => b.color)`
- Center label shows the total formatted for the active mode (e.g. `3,040 hrs` or `$182,400`)
- Tooltip: `"ProjectName — value"` (same format as bar tooltip)
- On `dataPointSelection` ApexCharts event, emits the corresponding `bar.projectId`
- Shows "No data for this period." text when `total() === 0` (same as bar)

### 2. `employee-breakdown-donut` (new)

**Location:** `src/app/features/dashboard/components/employee-breakdown-donut/`

**Inputs:**
- `bars: input.required<readonly EmployeeBreakdownBar[]>()` — reuses existing model
- `mode: input<SredMode>('hours')`

**Outputs:** none (no further drilldown from employees)

**Behaviour:**
- Same `ng-apexcharts` donut pattern as `sred-projects-donut`
- Colors from `EMPLOYEE_COLORS` palette (same 8-colour array used in `employee-breakdown-bar`)
- Center label shows the project total formatted for the active mode
- Tooltip: `"Name — value"`
- Shows "No data." text when all values are zero

---

## Dashboard changes

### `dashboard.ts`

Add one signal:

```typescript
readonly chartView = signal<'bar' | 'donut'>('bar');
```

Add handler:

```typescript
onChartViewChange(v: 'bar' | 'donut'): void {
  this.chartView.set(v);
}
```

Import both new components.

### `dashboard.html` — SR&ED Projects section header

Add the `Bar | Donut` toggle to the right side of the header row. Toggle only visible when **not** drilled in (hide when `drilledProject()` is truthy — the breadcrumb already occupies that area):

```html
@if (!drilledProject()) {
  <!-- Bar | Donut tab toggle -->
  <div class="flex ml-auto ...">
    <button [class.active]="chartView()==='bar'" (click)="onChartViewChange('bar')">Bar</button>
    <button [class.active]="chartView()==='donut'" (click)="onChartViewChange('donut')">Donut</button>
  </div>
}
```

### `dashboard.html` — projects chart area

Replace the current `@if (drilledProject()) … @else …` block:

```
@if (drilledProject())
  @if (chartView() === 'bar')   → app-employee-breakdown-bar   (existing)
  @else                         → app-employee-breakdown-donut  (new)
@else
  @if (chartView() === 'bar')   → app-sred-projects-bar         (existing)
  @else                         → app-sred-projects-donut        (new)
```

All inputs/outputs remain the same (`[bars]`, `[mode]`, `(projectClick)`).

---

## Files

| Action | Path |
|---|---|
| CREATE | `components/sred-projects-donut/sred-projects-donut.ts` |
| CREATE | `components/sred-projects-donut/sred-projects-donut.html` |
| CREATE | `components/employee-breakdown-donut/employee-breakdown-donut.ts` |
| CREATE | `components/employee-breakdown-donut/employee-breakdown-donut.html` |
| MODIFY | `dashboard.ts` — add `chartView` signal + handler + imports |
| MODIFY | `dashboard.html` — add toggle + conditional renders |

---

## Reuse

- `SredProjectBar`, `EmployeeBreakdownBar`, `SredMode` — existing models, no changes
- `ng-apexcharts` — already a dependency (`team-staff-chart` uses it)
- `EMPLOYEE_COLORS` — extract to a shared constant or duplicate in the new component (fine to duplicate at this scale)
- `projectBars()`, `employeeBreakdownBars()` computeds in `dashboard.ts` — unchanged, passed straight to the new components

---

## Out of scope

- Animating the transition between bar and donut views
- Persisting the user's chart-view preference across sessions
- A donut for the employee section (`team-staff-chart`) — separate concern
