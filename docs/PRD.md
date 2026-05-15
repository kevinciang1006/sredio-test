# SR&ED Financial Dashboard — Product Requirements Document

## 1. Context

This is a take-home task for the sred.io UI + Angular Developer Team Lead role. The task is a one-page financial dashboard that visualizes timesheet and salary data, computes monetary projections, and displays the results clearly.

The task evaluator (Xavier, the team lead) will hold a 30-minute review meeting on Thursday, 21 May. The evaluator will assess both code quality and the candidate's ability to verbally defend every decision.

The candidate is permitted to use AI coding tools (e.g. Claude Code, Cursor) but must fully understand every part of the implementation.

## 2. Objective

Build an intuitive, functional, one-page financial dashboard that:

- Displays timesheet data (hours per employee per project)
- Shows financial data (annual salary, hourly rate, monetary cost per project)
- Projects credit amounts for the remainder of the year
- Communicates the data with clear charts and visual summaries

## 3. Scope

### In scope (required by task)

1. Header with client information
2. Navigation bar
3. Grid of every employee with annual salary and hourly rate
4. Per-project chart showing hours worked and monetary amount, broken down by employee
5. Aggregate chart summing all projects (totals per project and grand total)
6. Projection for the remainder of the year (total hours and total monetary amount)

### Out of scope

- Authentication / login
- Backend API / database
- Multi-page routing
- Editing data (read-only dashboard)
- Animations beyond default chart transitions

## 4. Tech Stack

- **Framework:** Angular 21
- **Language:** TypeScript (strict mode, no `any`)
- **Components:** Standalone components throughout
- **State:** Signals for component state, `computed()` for derived values
- **Change Detection:** `ChangeDetectionStrategy.OnPush` everywhere
- **DI:** `inject()` function (no constructor injection)
- **Inputs/Outputs:** `input()` and `output()` functions (no decorators)
- **Control Flow:** `@if`, `@for`, `@switch` (no `*ngIf`, `*ngFor`)
- **UI Library:** Angular Material (latest)
- **Styling:** Tailwind CSS + Angular Material theming
- **Charts:** ngx-charts (Angular-native, declarative, good fit with signals)
- **Data:** Static TypeScript mock data file (no backend, no json-server)
- **Routing:** Single route, `HashLocationStrategy` for GitHub Pages compatibility
- **Build/Tooling:** Angular CLI defaults, Vite-based dev server (Angular 17+ default)
- **Testing:** Vitest or Karma+Jasmine for unit tests on calculation logic
- **Deployment:** GitHub Pages via GitHub Actions

## 5. Data Model

### Domain assumptions (documented for the review meeting)

- An employee is hired on a salary basis; their effective hourly rate is `annualSalary / 2000` (matching the sred.io convention seen in their product screenshots: $60,000 / 2000 = $30/hr).
- An employee logs hours to specific projects via timesheets.
- A project's monetary value for a given employee = `hours × hourly rate`.
- Project totals = sum of all employees' monetary contributions to that project.
- Year-to-date (YTD) values are computed as of a configurable "current date" constant.
- The full-year projection uses simple linear extrapolation: `(YTD ÷ days_elapsed) × 365`.

### TypeScript interfaces

```typescript
interface Client {
  id: string;
  name: string;
  claimPeriod: {
    startDate: string;  // ISO 'YYYY-MM-DD'
    endDate: string;    // ISO 'YYYY-MM-DD'
  };
  province: string;     // e.g. 'ON', 'BC'
  timeZone: string;     // e.g. 'EST'
}

interface Employee {
  id: string;
  name: string;
  email: string;
  hireDate: string;
  annualSalary: number;
  // hourlyRate is derived: annualSalary / 2000
}

interface Project {
  id: string;
  name: string;
  description: string;
  isSredEligible: boolean;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;         // ISO 'YYYY-MM-DD'
  hours: number;
}
```

### Mock data shape

- 1 client
- ~7 employees with realistic salaries ($45,000 – $120,000 range)
- ~5 projects (e.g. "Rendering System", "API Performance", "Mobile App", "ML Pipeline", "Unclaimed Work")
- Time entries distributed across Q1–Q3 of the claim year so the dashboard has meaningful YTD totals and a meaningful "remainder" to project

### "Current date" constant

A `CURRENT_DATE` constant (e.g. `2025-09-30`) used for all "as of today" calculations. Set so that YTD shows meaningful hours and the projection extrapolates over a non-trivial remainder of the year. This decision must be documented in the README.

## 6. Calculation Logic (the core of the assessment)

These are the formulas Xavier will most likely probe in the review meeting. Each must be a pure, testable function.

### Hourly rate

```
hourlyRate(employee) = employee.annualSalary / 2000
```

### Per-project hours for an employee

```
employeeHoursOnProject(employeeId, projectId, asOfDate?) =
  sum of time_entries where employeeId, projectId, and date <= asOfDate
```

### Per-project monetary cost for an employee

```
employeeCostOnProject(employeeId, projectId, asOfDate?) =
  employeeHoursOnProject(...) × hourlyRate(employee)
```

### Project total hours

```
projectTotalHours(projectId, asOfDate?) =
  sum of employeeHoursOnProject across all employees
```

### Project total cost

```
projectTotalCost(projectId, asOfDate?) =
  sum of employeeCostOnProject across all employees
```

### Grand totals

```
grandTotalHours = sum of projectTotalHours across all projects
grandTotalCost  = sum of projectTotalCost across all projects
```

### Year-end projection (linear)

```
daysElapsed = days between claimPeriod.startDate and CURRENT_DATE
totalDays   = days between claimPeriod.startDate and claimPeriod.endDate

projectedFullYearHours = (ytdHours / daysElapsed) × totalDays
projectedFullYearCost  = (ytdCost  / daysElapsed) × totalDays

remainderHours = projectedFullYearHours - ytdHours
remainderCost  = projectedFullYearCost  - ytdCost
```

This is the simplest defensible projection. The README must note that production-grade projections would use seasonality / weighted recent-period trends.

## 7. UI Structure

### Layout (top to bottom)

1. **Navigation bar** — sred.io-style top bar: logo, claim period selector (display-only), logged-in user (mocked), time zone indicator.
2. **Header card** — Client name, claim period date range, province.
3. **Summary cards row** — 3-4 big-number cards:
   - YTD Total Hours
   - YTD Total Cost
   - Projected Full Year Hours
   - Projected Full Year Cost
4. **Per-project breakdown** — Either tabs/dropdown per project, or a stacked-bar chart showing each project broken down by employee contribution. Show both hours and dollars (toggle).
5. **Aggregate chart** — Horizontal bar chart: each project's total hours and total cost; grand totals shown as a footer or summary card.
6. **Employee grid** — Material table: Name | Hire Date | Annual Salary | Hourly Rate | Total Hours Worked (YTD) | Total Cost (YTD). Sortable.

### Design language

- Match the visual feel of sred.io's product screenshots (clean, blue/white, generous whitespace).
- Use Angular Material components for table and tabs.
- Use Tailwind for layout and spacing.
- Currency formatted via Angular's `currency` pipe (USD).
- Numbers formatted with thousands separators.

## 8. Project Structure

```
src/
  app/
    core/
      models/
        client.model.ts
        employee.model.ts
        project.model.ts
        time-entry.model.ts
      services/
        dashboard-data.service.ts      // loads mock data, exposes as signals
        calculations.service.ts        // all pure calculation functions
      data/
        mock-data.ts                   // exports CLIENT, EMPLOYEES, PROJECTS, TIME_ENTRIES, CURRENT_DATE
    features/
      dashboard/
        dashboard.component.ts         // the one page
        components/
          nav-bar/
          client-header/
          summary-cards/
          project-breakdown-chart/
          aggregate-chart/
          employee-grid/
    app.config.ts
    app.routes.ts
    app.component.ts
  styles/
    tailwind.css
README.md
CLAUDE.md
.github/workflows/deploy.yml
```

## 9. Code Quality Standards

- TypeScript strict mode; no `any`.
- All components standalone, all `ChangeDetectionStrategy.OnPush`.
- All inputs use `input()` / `input.required()`; all outputs use `output()`.
- All DI via `inject()`.
- All control flow uses `@if` / `@for` / `@switch`.
- No constructor logic (use `inject()` at field level).
- All calculation logic in pure functions in `calculations.service.ts`; unit tests cover the projection math and aggregations.
- Components are presentational where possible; data flows down via signal inputs, state lives in the dashboard component or service.
- No `subscribe()` in components; if observables are needed, use `toSignal()` or `async` pipe.
- No `*ngIf`, `*ngFor`, `@Input` decorator, constructor injection, or any decorator-era patterns.
- Commit history must be meaningful: feature-scoped commits, not "wip" or "fix stuff."

## 10. Testing

Unit tests focused on:
- `hourlyRate()` — derivation
- `projectTotalHours()` and `projectTotalCost()` — aggregation
- `projectFullYear()` — linear extrapolation math
- Date-elapsed and date-total-days calculations

These are the highest-leverage tests because they cover the logic Xavier will most likely ask about. Component tests are nice-to-have but not the priority for a 1-2 day task.

## 11. Deployment

- Deploy to GitHub Pages via a GitHub Actions workflow on push to `main`.
- Use `HashLocationStrategy` so the SPA works on refresh on GitHub Pages.
- The deployed URL is included in the README and shared with Amisha after completion.

## 12. README Requirements

The README must include:
- One-paragraph summary of the app
- Live demo URL
- Tech stack list
- Project structure overview
- **Design decisions section** — explicitly documenting:
  - Why ngx-charts over Chart.js
  - Why signals + computed over RxJS for derived state
  - Why static mock data (no backend)
  - The `CURRENT_DATE` constant and why it's set to its chosen date
  - The projection formula and its limitations
  - The `hours / 2000` convention for hourly rate derivation
  - SR&ED domain assumptions (every hour considered eligible for simplicity; could be extended with per-project allocations)
- How to run locally
- How to run tests

## 13. Timeline

- **Today (15 May):** Scaffold project, set up data model, mock data, project structure
- **16–17 May:** Build core components (header, nav, summary cards, employee grid)
- **18 May:** Build charts (per-project breakdown, aggregate)
- **19 May:** Add unit tests, write README, polish UI
- **20 May:** Deploy to GitHub Pages, end-to-end smoke test, final review
- **21 May:** Review meeting with Xavier

## 14. Review Meeting Preparation

Before Thursday, the candidate must be able to defend, verbally:
- Every architectural choice (Angular 21 patterns, signals, OnPush, Material + Tailwind, ngx-charts)
- Every calculation formula and edge case (what if `daysElapsed = 0`? what if an employee has zero hours? what if a project has no time entries?)
- Every data model decision (why the schema is shaped this way; what would need to change for a real backend)
- Why the README's design decisions were made the way they were
