# SR&ED Financial Dashboard — Design Spec

**Date:** 2026-05-15
**Author:** Kevin Ciang (with Claude Code)
**Status:** Approved — proceed to implementation plan
**Review meeting:** Thursday 21 May with Xavier (sred.io team lead)
**Source PRD:** `docs/PRD.md`
**Reference repo:** `~/Documents/Projects/ng-finboard` (for patterns; not for blind copying)

---

## 1. Purpose

A production-shaped, two-feature Angular 21 web application. The primary feature is a one-page SR&ED financial dashboard (timesheet + salary data, monetary projections, charts) per the PRD. A secondary lightweight Profile feature exists to demonstrate cross-feature scaling, shared concerns, and routing.

The application is intentionally over-scaffolded relative to the literal PRD scope: empty production folders with explanatory `README.md` stubs (guards, interceptors, shared pipes/directives, environments) demonstrate awareness of real-world Angular project structure during the 30-minute review meeting.

## 2. Hard requirements (from PRD, retained)

- Angular 21, standalone components, `ChangeDetectionStrategy.OnPush` everywhere.
- TypeScript strict mode, no `any` (use `unknown` if narrowing required).
- `inject()` DI; no constructor injection.
- `input()` / `input.required()` for inputs; `output()` for outputs.
- `@if` / `@for` / `@switch` only — no `*ngIf`, `*ngFor`.
- Signals + `computed()` for state and derived state.
- No `subscribe()` in components; use `toSignal()` or `async` pipe.
- All calculation logic in pure functions; unit-tested.
- Mock data is deterministic — no `Math.random()` at runtime.

## 3. Decisions made during brainstorming (override PRD where in conflict)

| Topic | PRD says | Decision | Rationale |
|---|---|---|---|
| Component library | Angular Material | **Flowbite** (Tailwind + `flowbite` JS package, official integration per `flowbite.com/docs/getting-started/angular/`) | HR-stated preference; the `flowbite-angular` community wrapper is NOT used — only the official Flowbite docs pattern (Tailwind classes + `initFlowbite()`). |
| Chart library | ngx-charts | **ApexCharts via `ng-apexcharts`** | ngx-charts maintenance health is poor (729 open issues / 159 stale PRs). ApexCharts wrapper has 2 open issues, healthy core. SVG output suits SR&ED PDF export to CRA. Best visual polish for client-facing demos. Imperative options config is a minor tradeoff. |
| Currency | USD | **CAD** | SR&ED is a Canadian tax credit program; client province is ON. Defensible reframe of an obvious PRD oversight. |
| Sortable employee grid | Angular Material `MatTable` | **Hand-rolled `signal + computed` sort** over Flowbite-styled table markup | ~15 lines; 7 rows of data; no pagination needed; demonstrates idiomatic signals + computed. Adding TanStack Table for 7 rows is over-engineering. |
| Hours/Cost toggle | One toggle per chart | **One global toggle** signal driving both charts | Demonstrates "single source of truth signal → many computed views" pattern. |
| Test runner | Vitest or Karma+Jasmine | **Vitest** | Faster, modern, where Angular ecosystem is heading. Angular 21 experimental Vitest builder. |
| Change detection | Zone.js (implicit) | **Zoneless** (`provideZonelessChangeDetection()`) | Newer Angular 21 default; better perf; completes the modern stack (signals + OnPush + zoneless). |
| File naming | `*.component.ts` | **No `.component.` suffix** (`nav-bar.ts`, `nav-bar.html`, `nav-bar.scss`) | Angular 21 `ng generate` default. Matches ng-finboard. |
| Template/style style | Not specified | **Separate `.html` and `.scss` files** via `templateUrl` / `styleUrl` | Better readability for chart/table components; matches ng-finboard. |
| Folder grouping | Layer-based (`features/dashboard/components/`) | **Feature-based** (`features/dashboard/...`, `features/profile/...`) with cross-cutting in `core/` and `shared/` | Aligns with angular.dev style guide; supports scale to multiple features without restructure. |
| Calculation service | `CalculationsService` class | **Pure-function modules** in `features/dashboard/calculations/` | Services imply DI/state. Pure functions are easier to test and don't need DI. Folder name is its own contract: only SR&ED math goes here. |
| Service naming | `dashboard-data.service.ts` | **One service per REST resource** (`employees.service.ts`, `projects.service.ts`, etc.) | Mirrors how a real codebase fans out into per-resource HTTP services. Filename signals "this would talk to an API in production." |
| Mock data shape | Static `TIME_ENTRIES` array | **One file per resource** in `features/dashboard/mock/` | Mirrors REST resource boundaries. Easier targeted edits. |
| Mock data delivery | Sync import | **`Observable<T>` with `delay(200)`** returned from services | Production-shaped HTTP signature. Swap to real API = uncomment 2 lines per service. Demos loading state handling. |
| Environments | Not specified | **`environment.ts` / `environment.staging.ts` / `environment.prod.ts`** with `angular.json` `fileReplacements` | Standard Angular multi-env config; exposes `apiBaseUrl`, `useMocks` flag. |
| Scope: pages | Single dashboard route | **Three features: `/dashboard` (primary) + `/profile` (lightweight demo) + `/login` (auth demo)** | Demonstrates cross-feature scaling, shared models, routing, and a full auth lifecycle. Profile shows the "current user" via `ProfileService`. |
| Routing | Single route | **Nested routes with layout components + lazy-loaded children** (`loadComponent`) | Angular best-practices doc recommends lazy loading. Layout components separate authenticated vs guest chrome. |
| Layout component | Single `AppShell` | **`AuthenticatedLayoutComponent` + `GuestLayoutComponent`** (replaces the earlier "AppShell" naming) | Two distinct page chromes: full nav for protected routes, minimal centered card for `/login`. Naming makes the auth boundary visible in `app.routes.ts`. |
| Auth scope | Out of scope (stubs only) | **Implemented end-to-end with mock `AuthService`, `authGuard`, `authInterceptor`, `LoginComponent`** | Real production lifecycle: token state in signals, guard redirects unauthenticated users, interceptor attaches Bearer token, login form (Reactive). One-line swap to real `http.post('/auth/login')`. Implements (rather than stubs) the `guards/` and `interceptors/` folders. |
| Production-shape stubs | None | **README stubs in `shared/pipes/`, `shared/directives/`, `shared/components/`. `core/guards/` and `core/interceptors/` now contain real auth files + a README explaining where future guards/interceptors live.** | Best of both: implements the production-critical parts (auth) while documenting the convention for future expansion (e.g., `error.interceptor.ts`, `roles.guard.ts` for RBAC). |

## 4. Tech stack (final)

| Concern | Choice |
|---|---|
| Framework | Angular 21.2 (latest) |
| Change detection | Zoneless (`provideZonelessChangeDetection`) |
| Language | TypeScript strict, no `any` |
| UI primitives | Flowbite (core `flowbite` npm package + Tailwind classes per official docs) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Charts | ApexCharts via `ng-apexcharts` |
| Forms | Reactive forms (if any forms emerge; currently none) |
| HTTP | `HttpClient` with `withFetch()` (production-ready; mocks via Observable+delay until real backend) |
| Routing | `provideRouter(routes, withHashLocation(), withComponentInputBinding())` |
| State | Signals + `computed()`; `toSignal()` for Observable bridges |
| Testing | Vitest |
| Linting/formatting | ESLint + Prettier (Angular CLI defaults) |
| Deployment | GitHub Actions → GitHub Pages |
| Hosting strategy | `HashLocationStrategy` for SPA refresh on GitHub Pages |

## 5. Folder structure

```
src/
  app/
    core/                                       Cross-cutting, used by 2+ features
      api/
        auth.service.ts                         Auth state, mock login/logout, token in localStorage
      components/
        authenticated-layout/                   Wrapper for protected routes (nav + outlet)
        guest-layout/                           Wrapper for unauthenticated routes (centered card)
        nav-bar/                                Top nav with /dashboard, /profile, logout
      models/
        client.model.ts                         Used by dashboard + profile
        employee.model.ts                       Used by dashboard, profile, and auth (logged-in user)
      constants/
        app-constants.ts                        CURRENT_DATE, HOURS_PER_YEAR, ROUTES
      guards/
        auth.guard.ts                           Implemented — redirects unauth users to /login
        README.md                               Where future guards live (e.g. roles.guard.ts)
      interceptors/
        auth.interceptor.ts                     Implemented — attaches Bearer token to HTTP
        README.md                               Where future interceptors live (e.g. error.interceptor.ts)
    features/
      login/
        login.ts / .html / .scss
        models/
          credentials.model.ts
      dashboard/
        dashboard.ts / .html / .scss
        components/
          client-header/
          summary-card/
          hours-cost-toggle/
          project-breakdown-chart/
          aggregate-chart/
          employee-grid/
        services/
          employees.service.ts                  Observable<Employee[]> + env-aware swap comment
          projects.service.ts
          time-entries.service.ts
          clients.service.ts
        calculations/                           Pure functions, no DI, no class
          hourly-rate.ts
          project-totals.ts
          grand-totals.ts
          projections.ts
          date-utils.ts
          index.ts                              Barrel
        models/                                 Dashboard-only types
          project.model.ts
          time-entry.model.ts
          chart-data.model.ts
        mock/
          employees.mock.ts
          projects.mock.ts
          time-entries.mock.ts
          clients.mock.ts
      profile/
        profile.ts / .html / .scss
        components/
          profile-card/
        services/
          profile.service.ts
        models/
          profile.model.ts
        mock/
          profile.mock.ts
    shared/                                     Reusable UI promoted when 2+ features need it
      pipes/
        README.md                               Stub: e.g., currency-cad.pipe.ts
      directives/
        README.md                               Stub
      components/
        README.md                               Stub: cross-feature components
    app.ts / .html / .scss                      Root: <router-outlet />, initFlowbite()
    app.config.ts                               Providers: zoneless, animations, router, http
    app.routes.ts                               /dashboard, /profile, ** → /dashboard
  environments/
    environment.ts                              dev (mocks)
    environment.staging.ts                      staging API
    environment.prod.ts                         prod API
  styles.scss                                   Tailwind directives + Flowbite imports
  index.html
  main.ts
.github/workflows/deploy.yml                    Build + deploy to GitHub Pages
CLAUDE.md                                       Architectural constitution (see § 12)
README.md                                       Project README per PRD § 12
angular.json                                    fileReplacements for staging + production
package.json
tsconfig.json
```

### 5.1 Promotion rule (how cross-feature dependencies work)

- Default: keep new modules feature-local.
- When two features need the same thing, **promote**:
  - Domain types → `core/models/`
  - Reusable UI (pipes, directives, dumb components) → `shared/`
  - Singletons (auth, theme, layout services) → `core/`
- Promotion is an import-path refactor, not a re-architecture.

## 6. Data flow

```
HTTP / mock service        → Observable<T> with delay(200)
toSignal({initialValue})   → Signal<T>
Dashboard `inject()`s svc  → owns raw signals
pure calc functions        → wrapped in computed() at component level
                           → derived signals (totals, projections, chart data, rows)
signal inputs              → flow down to presentational children
output()                   → flows up (e.g., HoursCostToggle emits new mode)
```

- **State source of truth**: services hold raw signals (from mock or HTTP).
- **Reactivity boundary**: `DashboardComponent` is where raw signals become derived signals via pure-function calls inside `computed()`.
- **Children are presentational**: receive everything via `input()`, never `inject()` data services.
- **No `subscribe()` anywhere**. `toSignal()` bridges Observable→Signal.
- **Loading state**: `toSignal(obs, { initialValue: [] })`; `isLoading = computed(() => rawSignal().length === 0)` (and `isLoading` is fed to children to drive skeletons).
- **Mode signal**: lives in `DashboardComponent`. Toggle emits → dashboard `set()`s. Charts and any mode-aware computeds re-derive automatically.

## 7. Components

Every component: standalone, `OnPush`, `inject()` DI, `input()` / `input.required()` for inputs, `output()` for outputs, separate `.ts` / `.html` / `.scss`, `readonly` on signals.

### 7.1 Core / layouts
- **`AppComponent`** — root; renders `<router-outlet />` only. Listens to `Router.events` via `toSignal` and calls `initFlowbite()` on `NavigationEnd` so Flowbite's data-attribute behaviors wire up to newly rendered routes.
- **`AuthenticatedLayoutComponent`** (`core/components/authenticated-layout/`) — layout for protected routes. Renders `<app-nav-bar [client]="client()" />` + `<router-outlet />`. `inject()`s `ClientsService` so nav can show claim period without each feature re-fetching. Wraps `/dashboard` and `/profile` via nested route config.
- **`GuestLayoutComponent`** (`core/components/guest-layout/`) — layout for unauthenticated routes. Centered card container with sred.io logo, no nav. Wraps `/login`.
- **`NavBarComponent`** (`core/components/nav-bar/`) — Flowbite nav. Logo (left), claim-period selector (display-only), time-zone indicator, logged-in user info (from `AuthService.currentUser()`), route links to `/dashboard` and `/profile` (uses `routerLinkActive` for highlight), logout button (calls `AuthService.logout()` then `router.navigate(['/login'])`). Input: `client: Client | null`.

### 7.2 Dashboard feature
- **`DashboardComponent`** — page. `inject()`s `EmployeesService`, `ProjectsService`, `TimeEntriesService`, `ClientsService`. Bridges each `getAll()` to a signal via `toSignal`. Owns `mode: WritableSignal<'hours' | 'cost'>('hours')`. Derives:
  - `ytdTotalHours`, `ytdTotalCost`, `projectedFullYearHours`, `projectedFullYearCost`
  - `projectsBreakdown` (per-project, per-employee for stacked chart)
  - `aggregateData` (per-project totals for horizontal bar)
  - `employeeRows` (rows for grid: name, hireDate, salary, hourlyRate, ytdHours, ytdCost)
  - `isLoading`
- **`ClientHeaderComponent`** — Flowbite card; inputs: `client`, `isLoading`.
- **`SummaryCardComponent`** — reusable, 4×. Inputs: `label`, `value`, `format: 'currency' | 'number'`, `tone: 'neutral' | 'projected'`, `isLoading`. Uses Angular `decimal` and `currency` (CAD) pipes.
- **`HoursCostToggleComponent`** — Flowbite segmented control. `input<'hours'|'cost'>('hours')` for current mode; `output<'hours'|'cost'>()` on change.
- **`ProjectBreakdownChartComponent`** — `<apx-chart>` stacked vertical bar. Inputs: `data` (ApexAxisChartSeries-shaped), `mode`, `isLoading`. `computed()` produces chartOptions from inputs.
- **`AggregateChartComponent`** — `<apx-chart>` horizontal bar. Inputs: `data`, `mode`, `grandTotal`, `isLoading`. Renders grand total prominently below the chart.
- **`EmployeeGridComponent`** — Flowbite table. Inputs: `rows`, `isLoading`. Local state: `sort = signal<{ col: keyof EmployeeRow; dir: 'asc' | 'desc' }>({ col: 'name', dir: 'asc' })` + `sortedRows = computed(...)`. Click header → `toggleSort(col)`. Loading state: skeleton rows.

### 7.3 Profile feature
- **`ProfileComponent`** (`features/profile/profile.ts`) — page. `inject()`s `ProfileService`. Renders `ProfileCardComponent` with the current user's profile.
- **`ProfileCardComponent`** — Flowbite profile card. Inputs: `profile`, `isLoading`. Shows name, email, hire date, annual salary, derived hourly rate, role.

### 7.4 Login feature
- **`LoginComponent`** (`features/login/login.ts`) — page. Reactive form (`FormBuilder`) with email + password fields, Flowbite-styled card. Email field: required + email validator. Password field: required + minLength(4). Submit handler calls `AuthService.login(credentials)`; on success, `router.navigate(['/dashboard'])`; on failure, surfaces error in an inline Flowbite alert.
- Mock login behavior: any email + password ≥ 4 chars succeeds. Stores fake JWT `'mock-token-' + Date.now()` and the mock `currentUser` (first employee from `employees.mock.ts`) in `localStorage` and in `AuthService` signals.
- Reactive forms chosen because the Angular best-practices doc explicitly recommends Reactive over Template-driven.

### 7.5 Cross-cutting: AuthService, authGuard, authInterceptor
- **`AuthService`** (`core/api/auth.service.ts`): exposes `readonly currentUser = signal<Employee | null>(...)`, `readonly token = signal<string | null>(...)`, `readonly isAuthenticated = computed(() => !!this.token())`. Methods: `login(credentials): Observable<void>` (returns `of(void).pipe(delay(200))` after setting signals; comment notes real swap to `http.post`), `logout(): void` (clears signals + localStorage). Reads localStorage on construction to rehydrate on refresh.
- **`authGuard`** (`core/guards/auth.guard.ts`): functional `CanActivateFn`. `inject(AuthService)`, return `auth.isAuthenticated() || inject(Router).parseUrl('/login')`.
- **`authInterceptor`** (`core/interceptors/auth.interceptor.ts`): functional `HttpInterceptorFn`. `inject(AuthService)`, clone request adding `Authorization: Bearer <token>` if token exists. Wired in `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor]))`. Demonstrable even with mocks because dev mode talks to `environment.apiBaseUrl` when `useMocks=false`.

## 8. Calculations (pure functions, split files)

Location: `features/dashboard/calculations/`

```ts
// hourly-rate.ts
export const HOURS_PER_YEAR = 2000;
export function hourlyRate(employee: Employee): number;  // annualSalary / 2000

// date-utils.ts
export function daysBetween(start: string, end: string): number;
export function daysElapsed(start: string, currentDate: string): number;

// project-totals.ts
export function employeeHoursOnProject(
  employeeId: string, projectId: string, entries: TimeEntry[], asOf: string,
): number;
export function employeeCostOnProject(
  employee: Employee, projectId: string, entries: TimeEntry[], asOf: string,
): number;
export function projectTotalHours(
  projectId: string, entries: TimeEntry[], asOf: string,
): number;
export function projectTotalCost(
  projectId: string, employees: Employee[], entries: TimeEntry[], asOf: string,
): number;

// grand-totals.ts
export function grandTotalHours(entries: TimeEntry[], asOf: string): number;
export function grandTotalCost(
  employees: Employee[], entries: TimeEntry[], asOf: string,
): number;

// projections.ts
export interface Projection { projectedFullYear: number; remainder: number; }
export function projectFullYear(
  ytdValue: number, claimStart: string, claimEnd: string, currentDate: string,
): Projection;

// index.ts — barrel
```

Edge cases (all handled and tested):
- Employee with zero hours → 0
- Project with no entries → 0
- `daysElapsed = 0` → `{ projectedFullYear: ytdValue, remainder: 0 }` (no /0)
- Invalid date string → throws `Error('Invalid date: ' + str)`

## 9. Types and conventions

- **String literal unions over `enum`**: `type ChartMode = 'hours' | 'cost'`. No runtime emit, simpler tree-shaking.
- **`readonly`** on every component field (signals, computeds, injected services).
- **No `mutate()`** on signals (deprecated); use `update()` / `set()`.
- **No `ngClass` / `ngStyle`**: use `[class.foo]="..."` and `[style.color]="..."` bindings.
- **No `@HostBinding` / `@HostListener`**: use `host` object on the decorator.
- **Class names**: keep `Component` suffix on the class (`EmployeeGridComponent`); drop `.component.` from filenames only.
- **Selector prefix**: `app-` for all components.
- **Barrel files (`index.ts`)**: only in `calculations/` and `mock/`; avoid app-wide barrels to keep tree-shaking effective.

## 10. Mock data (deterministic)

Per `features/dashboard/mock/`:

- `clients.mock.ts` — 1 client. Realistic Canadian SaaS company name, province `ON`, time zone `EST`, claim period `2025-01-01` to `2025-12-31`.
- `employees.mock.ts` — 7 employees. Realistic names, hire dates, salaries between $45,000 and $120,000.
- `projects.mock.ts` — 5 projects (e.g. "Rendering System", "API Performance Optimization", "Mobile App Platform", "ML Inference Pipeline", "Unclaimed Work"). Each has `isSredEligible: boolean`.
- `time-entries.mock.ts` — ~3,000–5,000 entries spanning `2025-01-01` to `2025-09-30`. Realistic distribution: not every employee on every project, varying daily hours, occasional gaps. Generated once with a seeded RNG and baked in as static constants — no `Math.random()` at runtime.
- `profile.mock.ts` — the "current user" (a specific employee from `employees.mock.ts`).

`CURRENT_DATE = '2025-09-30'` lives in `core/constants/app-constants.ts`.

## 11. Routing + environments

### 11.1 `app.routes.ts`
```ts
export const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
      },
    ],
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/login/login').then(m => m.LoginComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
```

The auth boundary is visible in the routes file — protected children sit under `AuthenticatedLayoutComponent` guarded by `authGuard`; unauthenticated children sit under `GuestLayoutComponent` with no guard.

### 11.2 `app.config.ts`
```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
```

### 11.3 Environments

```ts
// environment.ts (dev)
export const environment = {
  production: false,
  useMocks: true,
  apiBaseUrl: 'http://localhost:3000/api',
};

// environment.staging.ts
export const environment = {
  production: false,
  useMocks: false,
  apiBaseUrl: 'https://staging-api.sredio.example.com',
};

// environment.prod.ts
export const environment = {
  production: true,
  useMocks: false,
  apiBaseUrl: 'https://api.sredio.example.com',
};
```

`angular.json` registers `fileReplacements` for `staging` and `production` build configurations.

Services consume `environment.apiBaseUrl` and either call `http.get<T>(...)` or return the mock observable depending on `environment.useMocks`. Default dev mode = mocks. Build with `--configuration=staging|production` to point at real APIs.

## 12. Testing

**Highest-leverage (must pass):**

- `features/dashboard/calculations/hourly-rate.spec.ts` — basic case + zero-salary edge.
- `features/dashboard/calculations/date-utils.spec.ts` — `daysBetween`, `daysElapsed`, year boundaries.
- `features/dashboard/calculations/project-totals.spec.ts` — known fixture, all aggregations.
- `features/dashboard/calculations/grand-totals.spec.ts` — sums across projects.
- `features/dashboard/calculations/projections.spec.ts` — linear math, `daysElapsed=0` edge, `currentDate >= endDate` edge.

**Nice-to-have (time permitting):**

- `EmployeeGridComponent` sort signal behavior.
- `HoursCostToggleComponent` emit behavior.

## 13. Documentation deliverables

### 13.1 `CLAUDE.md` (repo root)
Architectural constitution. Enforces all conventions from § 2, § 3, § 9. Any future changes must comply. References angular.dev best practices and Angular's `llms.txt` resources.

### 13.2 `README.md` (repo root)
- One-paragraph summary
- Live demo URL placeholder
- Tech stack
- Project structure overview
- **Design Decisions** section (Why ApexCharts over ngx-charts and Chart.js; why signals + computed over RxJS; why static mocks shaped as Observables; why `CURRENT_DATE = 2025-09-30`; linear projection formula and limitations; why `salary / 2000`; SR&ED simplification — every hour is eligible; why Flowbite over Material; why feature-based folders)
- How to run locally
- How to run tests
- How to build for staging / production

### 13.3 Inline README stubs
Each empty production-shape folder (`core/guards/`, `core/interceptors/`, `shared/pipes/`, `shared/directives/`, `shared/components/`) contains a `README.md` explaining purpose, naming convention, and an example. Each explicitly states "Not implemented — stubbed to demonstrate production layout."

## 14. Deployment

`.github/workflows/deploy.yml`:

1. Checkout
2. Node 20
3. `npm ci`
4. `npm test -- --run` (Vitest one-shot)
5. `ng build --configuration=production --base-href=/<repo-name>/`
6. Deploy `dist/<app-name>/browser` to `gh-pages` via `peaceiris/actions-gh-pages@v4`

`HashLocationStrategy` via `withHashLocation()` so SPA routes work on refresh on GitHub Pages.

## 15. Out of scope (explicitly)

- Real HTTP backend (services are HTTP-shaped, return mock observables; one-line swap)
- Real auth provider (mock `AuthService` with localStorage; real swap is `http.post('/auth/login', creds)`)
- RBAC / role-based guards (stubbed in `core/guards/README.md`)
- Error interceptor (stubbed in `core/interceptors/README.md`)
- Password reset / signup flows
- json-server (incompatible with GitHub Pages; Observable + delay achieves the same demo goal)
- Editing data (read-only dashboard)
- i18n / multi-language
- Mobile-optimized layout (desktop primary; tablet acceptable)
- Animations beyond ApexCharts defaults and Flowbite transitions

## 16. Defensibility cheat-sheet (for the 21 May review)

Anticipated Xavier questions and short defenses:

- **Why Flowbite over Material?** HR-stated preference. Flowbite + Tailwind gives more design control than Material's opinionated theming, lower bundle weight, and is officially Angular-integratable via the `flowbite` package.
- **Why ApexCharts and not ngx-charts?** ngx-charts is slow-maintained (729 open issues / 159 stale PRs as of May 2026); ApexCharts is actively maintained, SVG output suits PDF export to CRA, broader chart-type coverage, better visual polish.
- **Why signals over RxJS for derived state?** Signals + `computed()` are the idiomatic Angular 21 primitive for synchronous derivation. RxJS is reserved for async streams.
- **Why pure functions instead of a CalculationsService class?** No DI or state needed. Pure functions are the easiest possible test target; folder name (`calculations/`) is a contract.
- **Why feature-based folders for one feature?** Demonstrates the structure sred.io would scale to. Adding `features/timesheet-entry/` later is drop-in, not re-architecture.
- **Why `salary / 2000`?** Matches the sred.io product convention ($60,000 / 2000 = $30/hr). Documented in README.
- **Why `CURRENT_DATE = 2025-09-30`?** Q3-end gives ~9 months YTD and a meaningful 3-month remainder to extrapolate; non-trivial projection demo.
- **Why linear projection?** Simplest defensible model. Production would weight recent periods and account for seasonality; documented as a known limitation.
- **Why Observable + delay() for mocks?** Production HTTP shape from day one. Swap to `http.get(...)` is a one-line change per service.
- **Why zoneless?** Angular 21 default for new apps; works seamlessly with signals + OnPush; better perf.
- **What if `daysElapsed = 0`?** Returns `{ projected: ytd, remainder: 0 }`. Unit-tested.
- **What if an employee has zero hours?** Returns 0 from all aggregations. Unit-tested.
- **Why two layout components instead of one?** Authenticated and guest routes have fundamentally different chrome (full nav vs centered card). Two layouts make the auth boundary visible in `app.routes.ts` and avoid conditional `@if (isAuthenticated)` branches in a single layout. Easier to grow (e.g. adding `/signup` re-uses `GuestLayout`).
- **Why mock auth instead of real provider?** Scope was take-home; real provider was deferred. The shape is production-ready: `AuthService.login()` returns `Observable<void>`, `authInterceptor` attaches the Bearer token. Swap `of(void).pipe(delay(200))` for `http.post('/auth/login', creds)` and the rest of the app is unchanged.
- **Why functional guards and interceptors?** Angular's deprecated class-based API is class guards/interceptors. The modern functional API (`CanActivateFn`, `HttpInterceptorFn`) is shorter, tree-shakable, and uses `inject()` natively.
- **Why localStorage for token?** Simplest demo persistence. In production, an httpOnly secure cookie set by the auth server would replace localStorage to mitigate XSS — documented as a known limitation in the README.

## 17. Implementation phasing (informs the plan)

1. Scaffold Angular 21 + zoneless + Tailwind v4 + Flowbite + ApexCharts + Vitest.
2. Folder structure, README stubs, environments.
3. Models, mock data, dashboard services (Observable+delay).
4. Pure calculation functions + unit tests.
5. `AuthService` + `authGuard` + `authInterceptor`.
6. `AuthenticatedLayoutComponent` + `GuestLayoutComponent` + `NavBarComponent`.
7. Routing (nested layout config, lazy `loadComponent`).
8. `LoginComponent` (reactive form, mock login, redirect).
9. Dashboard page composition + ClientHeader + SummaryCards.
10. HoursCostToggle + ApexCharts components (project breakdown + aggregate).
11. EmployeeGrid with hand-rolled sort.
12. Profile page + ProfileCard.
13. Loading skeletons across components.
14. README + CLAUDE.md + folder README stubs.
15. GitHub Actions deployment workflow.
16. Polish, smoke test, review-meeting prep.

Detailed step ordering and verification gates: see the implementation plan that follows this spec.
