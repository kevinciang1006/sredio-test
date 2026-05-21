# Component Audit — 2026-05-21

Interview-day study aid. Inventory of every reachable component, plus an interview cheatsheet and a list of follow-ups the audit surfaced.

Scope: `src/app/shared/`, `src/app/core/components/`, `src/app/features/*/components/`. Pages (`*-page.ts`, `dashboard.ts`, `profile.ts`, `login.ts`) are containers, not in this audit.

---

## What was deleted in this PR

Seven orphan component directories were removed today — every consumer trace was dead code, so they were taking up space and reading time without contributing to any reachable route:

ApexCharts orphans (5) — confirmed unused; ECharts versions are what the dashboard actually renders:
- `features/dashboard/components/employee-breakdown-donut/`
- `features/dashboard/components/aggregate-chart/`
- `features/dashboard/components/project-breakdown-chart/`
- `features/dashboard/components/sred-projects-donut/`
- `features/profile/components/profile-contributions/`

Dashboard orphans (2) — defined but never imported:
- `features/dashboard/components/client-header/`
- `features/dashboard/components/hours-cost-toggle/`

`apexcharts` and `ng-apexcharts` were uninstalled from `package.json`.

---

## A. Inventory

Verdict legend:
- **keep** — small, branded, or no good Flowbite swap.
- **migrate-later** — Flowbite has a drop-in equivalent; do not swap today.
- **investigate** — likely already using Flowbite or unclear; check before swapping.

### Shared

| Component | Path | What it does | Used by | Flowbite equivalent | Verdict |
|---|---|---|---|---|---|
| `AvatarComponent` | `shared/components/avatar/avatar.ts` | Initials in a colored circle; color derived deterministically from the name hash. | TopBar, EmployeeGrid, StaffEmployeeCard, StaffSalaryTable, ProfileCard, EmployeesTable, Profile page | Avatar | keep |
| `BadgeComponent` | `shared/components/badge/badge.ts` | Colored label in 6 variants (blue/green/red/yellow/gray/purple). | EmployeeGrid, ProfileCard, Profile page | Badge | keep |
| `InfoTooltipComponent` | `shared/components/info-tooltip/info-tooltip.ts` | Gray "i" icon that shows a help string on hover/focus. | PageHeader, DualKpiPanel, StaffSalaryTable, StaffSection | Tooltip | keep |
| `ToastComponent` | `shared/components/toast/toast.ts` | Bottom-right toast stack fed by `ToastService`. | AuthenticatedLayout | Toast | migrate-later |
| `EmployeeModalComponent` | `shared/components/employee-modal/employee-modal.ts` | Employee detail modal with project breakdown + mode tabs. | EmployeesPage, Dashboard | Modal | migrate-later |
| `TooltipDirective` | `shared/directives/tooltip.directive.ts` | Attaches dynamic tooltips with viewport-clamped positioning. | SideBar, TopBar, EmployeeBreakdownBar, SredProjectsBar | Tooltip | migrate-later (custom positioning > Flowbite default — verify before swap) |

### Core (cross-cutting)

| Component | Path | What it does | Used by | Flowbite equivalent | Verdict |
|---|---|---|---|---|---|
| `AuthenticatedLayoutComponent` | `core/components/authenticated-layout/` | Top bar + collapsible side bar + `<router-outlet>` + toast stack. | Router (tenant routes) | none (composite layout) | keep |
| `GuestLayoutComponent` | `core/components/guest-layout/` | Centered card layout for login. | Router (guest routes) | none | keep |
| `PageHeaderComponent` | `core/components/page-header/` | Page title + subtitle + optional badge + "last updated" tooltip + projected action slot. | EmployeesPage, Dashboard | none | keep |
| `SideBarComponent` | `core/components/side-bar/` | Fixed left nav, logo, active-route highlight, collapse toggle, "coming soon" items. | AuthenticatedLayout | Sidebar | migrate-later |
| `TopBarComponent` | `core/components/top-bar/` | Sticky header, tenant picker, search/notifications stubs, user avatar dropdown. | AuthenticatedLayout | Navbar + Dropdown | migrate-later |

### Dashboard feature

| Component | Path | What it does | Used by | Flowbite equivalent | Verdict |
|---|---|---|---|---|---|
| `ModeTabsComponent` | `dashboard/components/mode-tabs/` | 3-tab toggle: Hours / Expenditures / Credits. | EmployeeModal, Dashboard | Tabs | keep (very thin, custom styling tied to brand) |
| `ChartViewTabsComponent` | `dashboard/components/chart-view-tabs/` | 2-button toggle: bar / donut chart view. | EmployeeModal | Tabs | keep |
| `QuarterlyTimelineComponent` | `dashboard/components/quarterly-timeline/` | YTD + Q1–Q4 horizontal timeline with value labels. | Dashboard | Tabs / Stepper | keep |
| `SummaryCardComponent` | `dashboard/components/summary-card/` | Single KPI card with label, value, blue/neutral border. | Dashboard | Card | keep |
| `DualKpiPanelComponent` | `dashboard/components/dual-kpi-panel/` | Side-by-side current vs projected SR&ED + daily pace + toggleable equation. | Dashboard | none (composite) | keep |
| `EmployeeGridComponent` | `dashboard/components/employee-grid/` | Sortable employee table: name, hire date, salary, hourly rate, YTD. | Dashboard | Tables | migrate-later |
| `EmployeeBreakdownBarComponent` | `dashboard/components/employee-breakdown-bar/` | Custom horizontal bar chart by employee with currency/hours tooltips. | Dashboard | none (custom SVG/DOM) | keep |
| `EmployeeBreakdownEchartsComponent` | `dashboard/components/employee-breakdown-echarts/` | ECharts pie chart for employee breakdown. | Dashboard | none (chart) | investigate (chart layer) |
| `SredProjectsBarComponent` | `dashboard/components/sred-projects-bar/` | Stacked horizontal bar of SR&ED vs non-eligible projects with hover effect. | Dashboard, EmployeeModal | none | keep |
| `SredProjectsEchartsComponent` | `dashboard/components/sred-projects-echarts/` | ECharts pie for SR&ED projects, highlight/downplay on click. | Dashboard, EmployeeModal | none | investigate |
| `SredCreditsPolarComponent` | `dashboard/components/sred-credits-polar/` | ECharts polar bar: credits vs remaining expenditure by project. | Dashboard | none | investigate |
| `StaffEmployeeCardComponent` | `dashboard/components/staff-employee-card/` | Card with SVG progress arcs (claimed / unclaimed / credits) and centre KPI. | StaffSection | Card | keep |
| `StaffSectionComponent` | `dashboard/components/staff-section/` | Groups staff cards by team, plus an "Unassigned" bucket. | Dashboard | none | keep |
| `StaffSalaryTableComponent` | `dashboard/components/staff-salary-table/` | Collapsible sortable salary table. | Dashboard | Tables | migrate-later |

### Employees feature

| Component | Path | What it does | Used by | Flowbite equivalent | Verdict |
|---|---|---|---|---|---|
| `EmployeesTableComponent` | `features/employees/components/employees-table.ts` | Sortable employee table with sort state + row-click. | EmployeesPage | Tables | migrate-later |

### Profile feature

| Component | Path | What it does | Used by | Flowbite equivalent | Verdict |
|---|---|---|---|---|---|
| `ProfileCardComponent` | `features/profile/components/profile-card/` | Employee card: hire date, role, YTD hours/cost, active project count. | Profile | Card | keep |

---

## B. Interview cheatsheet

Likely talking points, 2–3 bullets each. Pulled from the actual code and `CLAUDE.md`.

### 1. Architecture constitution
- `CLAUDE.md` is the binding spec: Angular 21 standalone components, OnPush everywhere, zoneless change detection, signals + `computed()` for derived state, `inject()` for DI, functional guards/interceptors, no `*ngIf`/`*ngFor`, no `ngClass`/`ngStyle`.
- Pure functions for math live in `features/dashboard/calculations/`. Reusable UI gets promoted from a feature into `shared/` only when a second feature needs it.

### 2. Routing & layouts
- `app.routes.ts` defines two top-level shells: `AuthenticatedLayoutComponent` (under `tenant/:tenantId`, gated by `authGuard` + `tenantGuard`) and `GuestLayoutComponent` (login).
- Feature pages are lazy-loaded via `loadComponent: () => import(...)`.

### 3. Mock vs real API
- Services return `Observable<T>` shaped exactly like the eventual real API. When `useMocks` is on, they emit from a seeded mock with `delay()`; flipping to real means swapping the mock call for `http.get(...)` — a one-line change.
- `environment.ts` / `environment.staging.ts` / `environment.prod.ts` swap via `angular.json` `fileReplacements`. Current state: `useMocks: true` in prod because there is no backend yet (commit `7a44a45`).

### 4. Dashboard data flow
- `DashboardComponent` orchestrates a lot: `PageHeader`, `QuarterlyTimeline`, `SummaryCard`s, `DualKpiPanel`, `EmployeeGrid`, `StaffSection`, the two breakdown charts (`EmployeeBreakdownBar` + `EmployeeBreakdownEcharts`), `SredProjects*` chart trio, and the `EmployeeModal`.
- Mode is a `'hours' | 'cost' | 'credits'` string literal (per CLAUDE.md rule on unions over enums). `ModeTabsComponent` flips it; everything downstream reads via signals/computed.

### 5. Charts: ECharts, not ApexCharts
- We use `echarts` via `ngx-echarts`. ApexCharts was uninstalled today — 5 orphan components had been carrying the dep without ever being rendered.
- The pie/polar charts (`EmployeeBreakdownEcharts`, `SredProjectsEcharts`, `SredCreditsPolar`) drive selection state via `highlight` / `downplay` actions on click.

### 6. Custom bar charts (no chart library)
- `EmployeeBreakdownBarComponent` and `SredProjectsBarComponent` are hand-rolled in CSS/SVG — they are intentionally not ECharts because they need tighter brand styling and tooltip behavior.

### 7. UI primitives & Flowbite
- Flowbite is installed and `initFlowbite()` is wired in `app.ts`, but the codebase mostly predates that decision — many primitives (modal, toast, tooltip, dropdown, tables, sidebar, navbar) were hand-rolled. `CLAUDE.md` now has a "UI primitives (Flowbite first)" section so future work reaches for Flowbite before adding new custom Tailwind.
- The Flowbite component index is in `docs/flowbite-llms.txt` (source: https://flowbite.com/docs/getting-started/llm/).

### 8. Login
- Only place in the app where `subscribe()` is allowed in a component — the form's submit handler is an imperative side-effect, not a data subscription. This is called out as an exception in `CLAUDE.md`.

---

## C. Post-interview follow-ups

Surfaced by this audit; explicitly deferred so today's diff stays small and explainable.

- **Bundle budget** — `f81782a` raised the initial-bundle budget to 1.00 MB. After Apex removal the build is **still 1.04 MB** (35 KB over) — Apex was already being tree-shaken because nothing reachable imported it, so the bump was actually for ECharts. Either bump the budget to ~1.1 MB to make CI green, or lazy-load the dashboard's chart components more aggressively.
- **Migrate `EmployeeModalComponent` to Flowbite Modal** — biggest single win; current implementation is the largest hand-rolled overlay.
- **Migrate the three tables (`EmployeeGrid`, `StaffSalaryTable`, `EmployeesTable`) to Flowbite Tables** — visually consistent and reduces hand-rolled sort/scroll code.
- **Migrate `ToastComponent` to Flowbite Toast** — keep the `ToastService` API, swap the markup only.
- **`TopBarComponent` dropdown audit** — confirm whether the avatar dropdown is already using Flowbite's data-attribute pattern under the hood or hand-rolled.
- **`TooltipDirective` decision** — Flowbite Tooltip is simpler, but ours has viewport clamping. Decide whether the clamping is worth keeping a custom directive.
- **Add Angular guidance reference** — `CLAUDE.md` already links Angular's llms.txt; consider mirroring it to `docs/angular-llms.txt` like we did for Flowbite, if offline AI work is common.
