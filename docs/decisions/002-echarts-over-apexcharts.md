# ADR 002: Migrate pie/donut charts from ApexCharts to Apache ECharts

**Status:** Accepted  
**Date:** 2026-05-20  
**Supersedes:** The "Why ApexCharts" rationale in README.md (bar charts are unaffected)

## Context

The project initially chose ApexCharts (`ng-apexcharts`) for all charts. After implementing
solid pie charts for the SR&ED Projects and Employee Breakdown views, a side-by-side
comparison was run with Apache ECharts (`echarts` + `ngx-echarts`) to evaluate visual
quality and developer ergonomics.

## Decision

Replace the ApexCharts pie/donut components with ECharts equivalents. Bar chart components
(`sred-projects-bar`, `employee-breakdown-bar`) stay as custom Angular templates — no
chart library is used for those.

## Rationale

| Concern | ApexCharts | ECharts |
|---------|-----------|---------|
| Pie hover interaction | Requires `::ng-deep` CSS hacks to reach SVG paths | Native `emphasis.scale` config — no style piercing |
| Inside labels | Needs `dropShadow: false` workaround; sometimes clips | First-class `label.position: 'inside'` with clean rendering |
| Bundle (treeshakable) | Entire library in one chunk (~540 kB) | Per-module imports; `PieChart` + 2 components + `CanvasRenderer` ≈ small delta on the lazy dashboard chunk |
| Animation quality | Good | Noticeably smoother; built-in easing and enter/exit transitions |
| Config ergonomics | Requires separate `series`, `chart`, `plotOptions`, `dataLabels` bindings on `<apx-chart>` | Single `[options]` object — cleaner computed signal |

ApexCharts remains installed for now; it is not removed until all chart consumers are migrated
and the decision is confirmed stable.

## Consequences

- `ng-apexcharts` and `apexcharts` remain in `package.json` temporarily.
- New pie/donut components use the selector prefix `sred-projects-echarts` / `employee-breakdown-echarts`.
- `app.config.ts` registers only the ECharts modules actually used (`PieChart`, `TooltipComponent`, `LegendComponent`, `CanvasRenderer`) via `echarts.use()` before `provideEchartsCore({ echarts })` — this keeps the bundle treeshakable.
- When a new chart type is needed, add only its ECharts module to the `echarts.use()` call in `app.config.ts`.
