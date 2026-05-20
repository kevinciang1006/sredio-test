# Chart Visual Improvements — Design Spec

**Date:** 2026-05-20
**Branch:** feat/staff-section-mode-aware (or next feature branch)

---

## Scope

Three visual improvements to the SR&ED dashboard charts:

1. Bar charts — taller, more prominent value labels
2. Pie/donut charts — switch to solid pie with inside value labels and bottom legend
3. Pie hover interaction — scale + outline on hover

---

## 1. Bar Charts

Applies to both `sred-projects-bar` and `employee-breakdown-bar`.

### Current state
- Height: `h-16` (64px)
- Name + value stacked, both `text-xs` (12px), white, `font-medium`

### New state
- Height: `h-24` (96px)
- **Name row**: 9px, uppercase, `letter-spacing: 0.04em`, `rgba(255,255,255,0.8)` — de-emphasised label
- **Value row**: 16px, `font-weight: 700`, white — number + unit on one line (e.g. `1,204 hrs` or `$96,320`)

### Template change (same pattern in both components)

```html
<button ... class="... h-24 ...">
  <span class="block w-full truncate px-1 text-center"
        style="font-size:9px; font-weight:400; letter-spacing:0.04em; text-transform:uppercase; color:rgba(255,255,255,0.8);">
    {{ bar.projectName }}
  </span>
  <span class="block w-full truncate px-1 text-center"
        style="font-size:16px; font-weight:700; color:white; line-height:1.2;">
    @if (mode() === 'hours') { {{ bar.value | number:'1.0-0' }} hrs }
    @else { {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }} }
  </span>
</button>
```

The Tailwind class `h-16` becomes `h-24` on the flex container. No other structural changes.

---

## 2. Pie Charts (replacing donuts)

Applies to both `sred-projects-donut` (renamed concept only — file stays same) and `employee-breakdown-donut`.

### Changes to ApexCharts config

| Property | Was | Now |
|---|---|---|
| `chart.type` | `'donut'` | `'pie'` |
| `plotOptions.pie.donut` | present (size, center labels) | removed entirely |
| `dataLabels.enabled` | `false` | `true` |
| `dataLabels.formatter` | — | returns value + unit string |
| `legend.position` | `'right'` | `'bottom'` |

### `dataLabels` formatter

```ts
dataLabels: {
  enabled: true,
  formatter: (val: number, opts: { seriesIndex: number }) => {
    const raw = this.visibleBars()[opts.seriesIndex]?.value ?? 0;
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
}
```

`val` from ApexCharts is the percentage — we ignore it and use the raw value from `visibleBars()` via `seriesIndex`.

### Legend

```ts
legend: {
  show: true,
  position: 'bottom' as const,
  horizontalAlign: 'center' as const,
}
```

Legend shows name only (value is already visible on the slice).

### Center total removal

The `plotOptions.pie.donut.labels` block that showed a center total is removed. With a solid pie there is no center to write into.

---

## 3. Pie Hover Interaction

### Behaviour
- Hovering a slice: scales it outward by 10% from the pie center + adds a white stroke outline
- Transition: 200ms ease
- Clicking a slice: existing drill-down behavior is unchanged

### Implementation

Add a component-scoped style (or `:host ::ng-deep`) in each donut component's `.ts` or a paired `.scss` file:

```scss
::ng-deep apx-chart .apexcharts-pie-series path {
  transition: transform 200ms ease, stroke 200ms ease, stroke-width 200ms ease;
}

::ng-deep apx-chart .apexcharts-pie-series path:hover {
  transform: scale(1.10);
  transform-origin: /* set to chart center via JS — see note */;
  stroke: white;
  stroke-width: 2px;
}
```

**Transform-origin:** Add `transform-box: view-box` so the transform origin is relative to the SVG viewport (the whole chart) rather than each path's own bounding box. Combined with `transform-origin: 50% 50%`, this scales each slice outward from the pie center with no JS required — as long as the chart SVG fills its container symmetrically, which ApexCharts does by default.

---

## Files to change

| File | Change |
|---|---|
| `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html` | height + label style |
| `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html` | height + label style |
| `src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.ts` | pie config, dataLabels, bottom legend |
| `src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.ts` | pie config, dataLabels, bottom legend |
| `src/app/features/dashboard/components/sred-projects-donut/sred-projects-donut.html` (if exists) | no change expected |
| `src/app/features/dashboard/components/employee-breakdown-donut/employee-breakdown-donut.html` (if exists) | no change expected |
| Hover CSS | inline `styles` array in each donut component, or a paired `.scss` |

---

## Verification

1. `ng build` — no TypeScript errors
2. Bar charts show 96px height; value text is clearly larger than the label text
3. Pie charts show solid (no hole), values inside slices, legend centered at bottom
4. Switching mode (hours → cost → credits) updates slice labels and legend correctly
5. Hovering a pie slice: smooth scale-out + white outline; no layout shift
6. Clicking a slice: drill-down fires as before (sred-projects only)
7. Empty state: "No data for this period" message still shows when `total() === 0`
