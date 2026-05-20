# sredio — SR&ED Financial Dashboard

A production-shaped Angular 21 dashboard for visualising timesheet and salary data and projecting SR&ED-eligible monetary credits for the remainder of the year.

**Live demo:** https://kevinciang1006.github.io/sredio-test/

## Task coverage

The take-home brief asked for six things. Everything is implemented and exceeded:

| # | Requirement | Implementation |
|---|---|---|
| 1 | Header with client information | Top bar (tenant switcher, claim period, timezone) + page header with claim status |
| 2 | Navigation bar | Collapsible sidebar (Dashboard, Profile) + top bar with user dropdown |
| 3 | Employee grid — salary + hourly rate | Staff Salary Table: name, dates, expected/confirmed salary, hourly rate, YTD hours, YTD cost |
| 4 | Per-project chart: hours + monetary | SR&ED Projects bar (mode-switchable) with drill-down to per-employee breakdown |
| 5 | All-projects sum + grand total | Quarterly Timeline (Q1/Q2/Q3/Q4/YTD) + Dual KPI panel (YTD + projected full year) |
| 6 | Full-year projection | Linear extrapolation KPI: `(ytd / daysElapsed) × totalDays` |

## Tech stack

- Angular 21.2, zoneless change detection
- TypeScript strict, no `any`
- Tailwind CSS v4
- Flowbite (Tailwind component patterns + `flowbite` npm package)
- Apache ECharts via `ngx-echarts` (pie/donut charts); ApexCharts (`ng-apexcharts`) retained for reference during migration
- Reactive forms
- Vitest
- GitHub Actions → GitHub Pages

## Project structure

```
src/app/
  core/           cross-cutting concerns (auth, layouts, nav, shared models, guards, interceptors)
  features/
    dashboard/    SR&ED dashboard — components, services, calculations, models, mock data
    employees/    Employees page — searchable, filterable, sortable table
    login/        mock auth login flow
    profile/      authenticated user profile page
  shared/         promoted reusable UI (AvatarComponent, BadgeComponent, EmployeeModalComponent,
                  InfoTooltipComponent, ToastComponent, ShortDatePipe, TooltipDirective)
src/environments/ dev / staging / prod env config (angular.json fileReplacements)
```

See `CLAUDE.md` for the binding architectural rules.

## Design decisions

- **Why ECharts (not ApexCharts or ngx-charts) for pie charts?** ngx-charts maintenance health is poor (729 open issues / 159 stale PRs as of May 2026). ApexCharts was the initial choice and remains installed, but a side-by-side comparison in May 2026 showed ECharts has cleaner inside-label rendering, native `emphasis.scale` for hover (no `::ng-deep` needed), smoother animations, and a single `[options]` binding that pairs better with Angular signals. ECharts is also fully treeshakable — only the chart types and components actually used are bundled. See `docs/decisions/002-echarts-over-apexcharts.md`.
- **Why signals + computed over RxJS for derived state?** Synchronous derivation is what `computed()` is designed for. RxJS is reserved for async streams. The codebase has zero `BehaviorSubject` and zero `subscribe()` for data — `toSignal()` bridges any Observable into the signal world.
- **Why pure functions for calculations instead of a CalculationsService class?** Services imply DI and (often) state. The SR&ED calculations have neither. Pure functions in `features/dashboard/calculations/` are the simplest possible unit-test targets: feed inputs, assert outputs.
- **Why `CURRENT_DATE = '2026-05-19'`?** This is the mock "today" snapshot date — it gives ~5 months of YTD data for the active 2026 period and a meaningful 7-month remainder for the projection to extrapolate over. The dashboard's `asOf` is a `computed()` signal that returns `min(CURRENT_DATE, activeClaimPeriod.endDate)`, so viewing a past period (e.g. 2025) uses Dec 31 as the cutoff rather than bleeding 2026 entries in.
- **Linear projection formula and its limitation.** `projectFullYear(ytd) = (ytd / daysElapsed) × totalDays`. A production model would weight recent periods and account for seasonality; this is the simplest defensible model.
- **Why `salary / 2000` for hourly rate?** Matches the sred.io product convention ($60,000 / 2000 = $30/hr).
- **Why per-project SR&ED eligibility?** Each `Project` has an `isSredEligible` flag. Hours on ineligible projects contribute to "Unclaimed" bars and are excluded from the SR&ED credit calculation — closer to real CRA claim logic than treating every hour as eligible.
- **Why Flowbite + Tailwind over Angular Material?** HR direction during the task brief. Flowbite (the official `flowbite` package + Tailwind classes) gives more design control than Material's opinionated theming and integrates natively with our Tailwind setup.
- **Why feature-based folder structure?** Aligns with Angular's style-guide recommendation for medium-to-large apps. Adding a new feature is a drop-in, not a refactor.
- **Why mock Auth + Observable + delay()?** Demonstrates the production HTTP shape without requiring a backend. Real swap is a one-line replacement per service. The `authGuard` and `authInterceptor` are real implementations.
- **Why CAD currency?** SR&ED is a Canadian tax credit program; client province is ON.
- **Why multi-tenant routing (`/tenant/:id/dashboard`)?** Mirrors how sred.io works — one admin user manages multiple client accounts. Tenant ID flows from the route into every service call; switching tenants is a navigation, not a reload.

## Run locally

```bash
npm install
npm start
```

Visit `http://localhost:4200`. Sign in with any email and a password of at least 4 characters (mock auth).

## Run tests

```bash
npm test          # one-shot
npm run test:watch  # watch mode
npm run test:ui     # Vitest UI
```

## Build for environment

```bash
npm run build                                   # dev (default; mocks)
npm run build -- --configuration=staging        # staging env
npm run build -- --configuration=production     # production env
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml` which builds with `--configuration=production` and publishes to GitHub Pages.

The live demo: https://kevinciang1006.github.io/sredio-test/

## License

Take-home submission, May 2026. Not for redistribution.
