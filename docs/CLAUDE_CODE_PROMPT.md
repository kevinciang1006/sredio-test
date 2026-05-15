# Claude Code Prompt — SR&ED Financial Dashboard

You are scaffolding a complete Angular 21 application for an Angular Developer Team Lead take-home task. The full specification is in `PRD.md` — read it first and treat it as the source of truth.

## Mission

Generate a production-quality, one-page financial dashboard that displays timesheet and salary data, computes monetary projections for the remainder of the year, and visualizes the data with charts. The full task brief, data model, calculation formulas, project structure, and code quality standards are all defined in `PRD.md`.

This will be reviewed line-by-line by a senior engineer in a 30-minute meeting. Code quality, modern Angular patterns, and the defensibility of every architectural decision matter as much as functionality.

## Hard Requirements

### Angular conventions — these are non-negotiable

- **Angular 21**, generated via the latest Angular CLI.
- **Standalone components throughout.** Do not add `standalone: true` — it is the default in Angular 19+ and must remain implicit.
- **`ChangeDetectionStrategy.OnPush`** on every component without exception.
- **`inject()` function** for all dependency injection. No constructor injection anywhere.
- **`input()` and `input.required()` signal functions** for all component inputs. No `@Input()` decorators.
- **`output()` function** for all component outputs. No `@Output()` or `EventEmitter` direct usage.
- **`@if`, `@for`, `@switch`** for all control flow. No `*ngIf`, `*ngFor`, `*ngSwitch`. All `@for` blocks must include a `track` expression.
- **Signals + `computed()`** for all reactive state. No `BehaviorSubject` for state. If observables are needed (rare here), bridge with `toSignal()`.
- **No `subscribe()` calls** in components. Use signals, `computed()`, or `async` pipe.
- **TypeScript strict mode.** No `any` types anywhere. Use `unknown` and narrow if truly needed.
- **No `*` directives, no decorator-era patterns of any kind.**

### Stack

- Angular 21
- Angular Material (latest)
- Tailwind CSS (configured for Angular)
- ngx-charts for all visualizations
- Vitest or Jasmine+Karma (default Angular CLI) for unit tests
- GitHub Actions workflow for deployment to GitHub Pages
- `HashLocationStrategy` configured in `app.config.ts`

## Project Structure

Generate exactly this structure (see `PRD.md` section 8 for details):

```
src/app/
  core/
    models/         — TypeScript interfaces
    services/       — DashboardDataService, CalculationsService
    data/           — mock-data.ts with CLIENT, EMPLOYEES, PROJECTS, TIME_ENTRIES, CURRENT_DATE
  features/
    dashboard/
      dashboard.component.ts
      components/
        nav-bar/
        client-header/
        summary-cards/
        project-breakdown-chart/
        aggregate-chart/
        employee-grid/
  app.component.ts
  app.config.ts
  app.routes.ts
```

## Data Model & Mock Data

Follow the TypeScript interfaces in `PRD.md` section 5 exactly. For the mock data file:

- 1 client (use a realistic Canadian SaaS company name; province `ON`; claim period `2025-01-01` to `2025-12-31`).
- 7 employees with realistic names, hire dates, and salaries spread between $45,000 and $120,000. Use 2000 hours/year as the divisor for hourly rate (matching sred.io's product convention).
- 5 projects with realistic SR&ED-style names: e.g. "Rendering System", "API Performance Optimization", "Mobile App Platform", "ML Inference Pipeline", "Unclaimed Work".
- Time entries distributed across `2025-01-01` through `2025-09-30`, totaling ~3,000–5,000 entries across all employees and projects. Make the distribution realistic — not all employees on all projects, varying hours per day, occasional gaps.
- Set `CURRENT_DATE = '2025-09-30'` so YTD shows ~9 months of data and the projection extrapolates over a meaningful remainder.

The mock data must be deterministic — no `Math.random()` at runtime. If you generate the data with randomness during scaffolding, seed it and bake the resulting values directly into the file as static constants.

## Calculation Service

Implement `CalculationsService` (or a set of pure functions, your choice — but pure and testable) covering every formula in `PRD.md` section 6:

- `hourlyRate(employee)`
- `employeeHoursOnProject(employeeId, projectId, asOfDate?)`
- `employeeCostOnProject(employeeId, projectId, asOfDate?)`
- `projectTotalHours(projectId, asOfDate?)`
- `projectTotalCost(projectId, asOfDate?)`
- `grandTotalHours(asOfDate?)`
- `grandTotalCost(asOfDate?)`
- `projectFullYear(ytdValue, claimStart, claimEnd, currentDate)` — linear extrapolation

Every function must be a pure function that takes its inputs explicitly. No hidden state. This makes them trivial to unit test.

Edge cases that must be handled:
- An employee with zero hours
- A project with zero time entries
- `daysElapsed = 0` (return zero / no projection)
- A date string in invalid format (defensive)

## Components

Each component must be:
- Standalone
- `ChangeDetectionStrategy.OnPush`
- Uses signal `input()` for inputs
- Uses `output()` for outputs (if any)
- Uses `inject()` for DI
- No constructor logic

### `NavBarComponent`
Top navigation bar styled after the sred.io screenshots: logo on the left, claim period and time zone indicator in the middle, mock user info on the right.

### `ClientHeaderComponent`
Shows the client name, claim period date range, and province. Takes `client` as a signal input.

### `SummaryCardsComponent`
Shows 4 big-number cards:
- YTD Total Hours
- YTD Total Cost (formatted as USD)
- Projected Full Year Hours
- Projected Full Year Cost (formatted as USD)

Takes the computed totals as signal inputs.

### `ProjectBreakdownChartComponent`
Stacked bar chart (ngx-charts `ngx-charts-bar-vertical-stacked` or similar): one bar per project, stacked by employee contribution. Toggle between "Hours" and "Cost" views via a toggle button.

### `AggregateChartComponent`
Horizontal bar chart (ngx-charts `ngx-charts-bar-horizontal`): one bar per project showing total hours OR total cost. Toggle between the two. Show grand total prominently below the chart.

### `EmployeeGridComponent`
Angular Material `MatTable` with columns:
- Name
- Hire Date
- Annual Salary
- Hourly Rate
- Total Hours Worked (YTD)
- Total Cost (YTD)

Sortable on all columns.

### `DashboardComponent`
The single page. Composes all the above components. Owns the master data signals (from `DashboardDataService`) and the computed signals (totals, projections) and passes them down.

## Styling

- Tailwind for layout (grids, flex, spacing, breakpoints).
- Angular Material for the table and any form controls.
- Color palette: clean professional, blue/white-based, matching the sred.io product screenshots.
- Generous whitespace.
- Responsive: works on desktop (primary), degrades gracefully on tablet. Mobile is not a priority.

## Testing

Write unit tests for `CalculationsService` covering:
- `hourlyRate` (basic case + zero salary edge case)
- `projectTotalHours` and `projectTotalCost` for a known project
- `grandTotalHours` and `grandTotalCost`
- `projectFullYear` (basic linear extrapolation + `daysElapsed = 0` edge case)

Component tests are not required.

## Documentation

### `CLAUDE.md` (in repo root)
Enforce the standards from `PRD.md` section 9 (modern Angular patterns, no decorator-era code, signals, OnPush everywhere, pure functions for calculations). Reference the Angular best-practices doc from `https://angular.dev/assets/context/best-practices.md`. This document is the project's architectural constitution — any future changes must comply.

### `README.md` (in repo root)
Must include all sections listed in `PRD.md` section 12:
- One-paragraph summary
- Live demo URL placeholder (`<TBD after deployment>`)
- Tech stack
- Project structure
- **Design Decisions** section explicitly covering:
  - Why ngx-charts over Chart.js
  - Why signals + `computed()` over RxJS
  - Why static mock data
  - Why `CURRENT_DATE = '2025-09-30'`
  - Linear projection formula and its limitations
  - Why `salary / 2000` for hourly rate
  - SR&ED simplification (every hour is eligible; production would have per-project allocations)
- How to run locally
- How to run tests

## Deployment

Generate `.github/workflows/deploy.yml` for GitHub Pages deployment on push to `main`:
- Checkout
- Setup Node 20
- Install
- Build with the correct `--base-href` for the GitHub Pages subpath
- Deploy `dist/<app-name>/browser` to the `gh-pages` branch via `peaceiris/actions-gh-pages` or `actions/deploy-pages`

Configure `HashLocationStrategy` in `app.config.ts` via `provideRouter(routes, withHashLocation())`.

## Acceptance Criteria

The scaffolded project must:

1. `ng serve` runs cleanly with no console warnings or errors
2. `ng build` succeeds with no warnings
3. `ng test` passes with all calculation unit tests green
4. Every component is standalone + OnPush + uses `inject()` + uses `input()` / `output()` + uses `@if`/`@for`
5. No `any` types anywhere
6. The dashboard renders all six required elements from `PRD.md` section 3
7. The numbers on screen are mathematically correct against the mock data
8. The GitHub Actions workflow file is valid YAML and deploys correctly when pushed
9. `CLAUDE.md` and `README.md` are complete and match `PRD.md`

## What to do

1. Read `PRD.md` end to end before writing any code.
2. Use `/brainstorming` to think through any decisions that are genuinely ambiguous (e.g. exact chart variants from ngx-charts, exact Tailwind theme choices) and document the rationale.
3. Use `/writing plan` to lay out the build sequence.
4. Scaffold the project and generate every file completely — no placeholders, no TODO comments, no "implement this later" stubs.
5. Verify acceptance criteria before finishing.

Begin.
