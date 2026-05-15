# SR&ED Financial Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-shaped Angular 21 SR&ED dashboard with Login, Dashboard, and Profile features, deployed to GitHub Pages, for the 21 May review with Xavier.

**Architecture:** Angular 21, zoneless, signals + computed, standalone components, OnPush everywhere. Feature-based folders (`features/login`, `features/dashboard`, `features/profile`) with cross-cutting concerns in `core/` and `shared/`. Flowbite + Tailwind v4 for UI, ApexCharts for charts, Vitest for tests. Mock services return `Observable<T>` with `delay()` so the production HTTP swap is a one-line change per service. Mock `AuthService` + functional `authGuard` + `authInterceptor` demonstrate the full auth lifecycle. Spec: `docs/superpowers/specs/2026-05-15-sred-dashboard-design.md`.

**Tech Stack:** Angular 21.2, TypeScript strict, Tailwind CSS v4, Flowbite (`flowbite` npm package), ApexCharts (`ng-apexcharts`), Vitest, GitHub Actions, GitHub Pages.

**Working directory:** `/Users/kevinciang/Documents/Sredio` (already a git repo, remote `origin` → `https://github.com/kevinciang1006/sredio-test`).

**Commit convention:** Conventional commits (`feat:`, `chore:`, `test:`, `docs:`, `fix:`, `style:`, `refactor:`). Commit after every task. Add `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer when commits are agent-authored.

---

## Phase 1 — Scaffold (Tasks 1–6)

### Task 1: Scaffold Angular 21 at repo root

**Files:**
- Create: `package.json`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `src/main.ts`, `src/index.html`, `src/styles.scss`, `src/app/app.ts`, `src/app/app.html`, `src/app/app.scss`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `public/favicon.ico`
- Move aside: existing `docs/`, `.gitignore` (to preserve them through `ng new`)

- [ ] **Step 1: Move docs and .gitignore aside**

```bash
cd /Users/kevinciang/Documents/Sredio
mv docs /tmp/sredio-docs
mv .gitignore /tmp/sredio-gitignore
ls -la   # should show only .git/
```

- [ ] **Step 2: Verify Angular CLI is available, install if needed**

```bash
npx -p @angular/cli@21 ng version
```
Expected: prints Angular CLI 21.x. If the command fails, install: `npm install -g @angular/cli@21`.

- [ ] **Step 3: Scaffold Angular into current directory**

```bash
cd /Users/kevinciang/Documents/Sredio
npx -p @angular/cli@21 ng new sredio --directory=. --routing --style=scss --skip-git --ssr=false --zoneless --inline-template=false --inline-style=false --package-manager=npm
```
Expected: Angular CLI creates `package.json`, `angular.json`, `tsconfig.json`, `src/`, etc.

If `ng new` errors saying the directory isn't empty (because of `.git/`), pass `--directory=.` works because `ng new` ignores `.git/`. If it still errors, instead run from `/tmp`:
```bash
cd /tmp && npx -p @angular/cli@21 ng new sredio-temp --skip-git --routing --style=scss --ssr=false --zoneless --inline-template=false --inline-style=false --package-manager=npm
cp -r /tmp/sredio-temp/. /Users/kevinciang/Documents/Sredio/
rm -rf /tmp/sredio-temp
```

- [ ] **Step 4: Restore docs/ and merge .gitignore**

```bash
cd /Users/kevinciang/Documents/Sredio
mv /tmp/sredio-docs ./docs
cat /tmp/sredio-gitignore >> .gitignore
echo "" >> .gitignore
echo "# Editor / agent state (preserved from initial repo)" >> .gitignore
echo ".claude/" >> .gitignore
# Deduplicate
sort -u .gitignore -o .gitignore
rm /tmp/sredio-gitignore
```

- [ ] **Step 5: Verify the app builds and serves**

```bash
cd /Users/kevinciang/Documents/Sredio
npm install
npm start
```
Expected: dev server starts on `http://localhost:4200`, shows the default Angular welcome page. Kill with Ctrl+C.

- [ ] **Step 6: Verify zoneless was applied**

Open `src/app/app.config.ts`. It should already contain `provideZonelessChangeDetection()` from the `--zoneless` flag. If it does not (older CLI didn't pick up the flag), edit `src/app/app.config.ts`:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
```

Also verify `src/main.ts` does NOT import `zone.js`. If it does, remove that import.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Angular 21 with zoneless change detection

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Configure Tailwind CSS v4 + Flowbite

**Files:**
- Modify: `package.json` (deps), `postcss.config.mjs` (create), `src/styles.scss` (Tailwind directives + Flowbite import), `angular.json` (Tailwind already detected by Angular CLI 21)

- [ ] **Step 1: Install Tailwind v4 + Flowbite**

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
npm install flowbite
```

- [ ] **Step 2: Create PostCSS config**

Create `postcss.config.mjs`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Configure Tailwind v4 content sources via CSS @source directives**

Replace `src/styles.scss` with:
```scss
@use 'tailwindcss';

@source "./app/**/*.{html,ts,scss}";
@source "../node_modules/flowbite";

@import 'flowbite/src/themes/default';

/* Global tweaks */
html, body { height: 100%; margin: 0; font-family: 'Inter', system-ui, sans-serif; }
body { @apply bg-gray-50 text-gray-900 antialiased; }
```

If `flowbite/src/themes/default` does not exist for the installed Flowbite version, replace that import with `@import 'flowbite';`. Verify by checking `ls node_modules/flowbite/`.

- [ ] **Step 4: Wire Flowbite JS in `src/main.ts`**

Add at the bottom of `src/main.ts` (after bootstrap):
```ts
import 'flowbite';
```

- [ ] **Step 5: Verify build still works**

```bash
npm start
```
Expected: page loads, no Tailwind/PostCSS build errors in the console.

- [ ] **Step 6: Smoke test Tailwind classes**

Edit `src/app/app.html`:
```html
<div class="p-8 bg-white rounded-lg shadow text-center">
  <h1 class="text-3xl font-bold text-blue-600">Tailwind + Flowbite is wired up.</h1>
</div>
<router-outlet />
```
Refresh browser. Expected: blue heading on a white card with shadow.

- [ ] **Step 7: Revert smoke-test HTML**

Edit `src/app/app.html` back to:
```html
<router-outlet />
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: configure Tailwind v4 and Flowbite

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Install ApexCharts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

```bash
npm install apexcharts ng-apexcharts
```

- [ ] **Step 2: Verify install**

```bash
ls node_modules/ng-apexcharts
ls node_modules/apexcharts
```
Both directories should exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: install ApexCharts and ng-apexcharts

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Switch test runner to Vitest

**Files:**
- Modify: `package.json` (deps + scripts), `angular.json` (test builder), `tsconfig.spec.json`
- Create: `vitest.config.ts`, `src/test-setup.ts`

- [ ] **Step 1: Uninstall Karma + Jasmine**

```bash
npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
rm -f karma.conf.js
```

- [ ] **Step 2: Install Vitest + jsdom + Angular test deps**

```bash
npm install -D vitest @vitest/ui jsdom @angular/build @analogjs/vitest-angular
```

- [ ] **Step 3: Create `vitest.config.ts`**

Create `vitest.config.ts` at repo root:
```ts
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vitest-angular/plugin';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
```

- [ ] **Step 4: Create `src/test-setup.ts`**

```ts
import '@analogjs/vitest-angular/setup-zoneless';
```

If that package path is not found in your installed version, fall back to:
```ts
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
```

- [ ] **Step 5: Update `tsconfig.spec.json`**

Replace with:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.spec.ts", "src/test-setup.ts"]
}
```

- [ ] **Step 6: Update `package.json` scripts**

In `package.json`, replace the existing `"test"` script with:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui",
```

- [ ] **Step 7: Verify Vitest runs (no tests yet → exits cleanly)**

```bash
npm test
```
Expected: Vitest starts, reports 0 tests found, exits 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: switch test runner from Karma to Vitest

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Multi-environment configuration

**Files:**
- Create: `src/environments/environment.ts`, `src/environments/environment.staging.ts`, `src/environments/environment.prod.ts`
- Modify: `angular.json` (fileReplacements for staging + production)

- [ ] **Step 1: Create environment files**

`src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  useMocks: true,
  apiBaseUrl: 'http://localhost:3000/api',
} as const;
```

`src/environments/environment.staging.ts`:
```ts
export const environment = {
  production: false,
  useMocks: false,
  apiBaseUrl: 'https://staging-api.sredio.example.com',
} as const;
```

`src/environments/environment.prod.ts`:
```ts
export const environment = {
  production: true,
  useMocks: false,
  apiBaseUrl: 'https://api.sredio.example.com',
} as const;
```

- [ ] **Step 2: Add fileReplacements to `angular.json`**

In `angular.json`, under `projects.sredio.architect.build.configurations`, ensure these exist:

```json
"production": {
  "budgets": [
    { "type": "initial", "maximumWarning": "1mb", "maximumError": "2mb" },
    { "type": "anyComponentStyle", "maximumWarning": "4kb", "maximumError": "8kb" }
  ],
  "outputHashing": "all",
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ]
},
"staging": {
  "outputHashing": "all",
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.staging.ts"
    }
  ]
}
```

(If `production` block already exists, only add the `fileReplacements` array. If `staging` doesn't exist, add it as a sibling.)

- [ ] **Step 3: Verify build succeeds in each configuration**

```bash
npm run build -- --configuration=production
npm run build -- --configuration=staging
npm run build
```
Each should complete without errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add dev/staging/prod environments with fileReplacements

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Create folder structure + README stubs

**Files:**
- Create directories and READMEs only.

- [ ] **Step 1: Create all folders**

```bash
cd /Users/kevinciang/Documents/Sredio
mkdir -p src/app/core/api
mkdir -p src/app/core/components/authenticated-layout
mkdir -p src/app/core/components/guest-layout
mkdir -p src/app/core/components/nav-bar
mkdir -p src/app/core/constants
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/models
mkdir -p src/app/features/dashboard/components/aggregate-chart
mkdir -p src/app/features/dashboard/components/client-header
mkdir -p src/app/features/dashboard/components/employee-grid
mkdir -p src/app/features/dashboard/components/hours-cost-toggle
mkdir -p src/app/features/dashboard/components/project-breakdown-chart
mkdir -p src/app/features/dashboard/components/summary-card
mkdir -p src/app/features/dashboard/services
mkdir -p src/app/features/dashboard/calculations
mkdir -p src/app/features/dashboard/models
mkdir -p src/app/features/dashboard/mock
mkdir -p src/app/features/login/models
mkdir -p src/app/features/profile/components/profile-card
mkdir -p src/app/features/profile/services
mkdir -p src/app/features/profile/models
mkdir -p src/app/features/profile/mock
mkdir -p src/app/shared/components
mkdir -p src/app/shared/directives
mkdir -p src/app/shared/pipes
```

- [ ] **Step 2: Create README stubs in empty production-shape folders**

Create `src/app/core/guards/README.md`:
```markdown
# Guards

Route guards live here. They run before navigation completes and decide whether the route can be activated.

## Convention
- One guard per file, named `<purpose>.guard.ts` (kebab-case).
- Use the functional API (`CanActivateFn`, `CanMatchFn`) — not the deprecated class-based one.
- Register in `app.routes.ts` via `canActivate: [authGuard]`.

## What's implemented here
- `auth.guard.ts` — redirects unauthenticated users to `/login`.

## What would live here later (RBAC, role checks, feature flags)
\`\`\`ts
// roles.guard.ts (example, not implemented)
export const rolesGuard = (allowed: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return allowed.includes(auth.currentUser()?.role) || router.parseUrl('/forbidden');
};
\`\`\`
```

Create `src/app/core/interceptors/README.md`:
```markdown
# Interceptors

HTTP interceptors live here. They intercept outgoing HTTP requests and incoming responses.

## Convention
- One interceptor per file, named `<purpose>.interceptor.ts`.
- Use the functional API (`HttpInterceptorFn`), not the class-based `HttpInterceptor`.
- Register in `app.config.ts` via `provideHttpClient(withInterceptors([...]))`.

## What's implemented here
- `auth.interceptor.ts` — attaches `Authorization: Bearer <token>` to outgoing requests when `AuthService.token()` is set.

## What would live here later
\`\`\`ts
// error.interceptor.ts (example, not implemented)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) inject(AuthService).logout();
      return throwError(() => err);
    }),
  );
};
\`\`\`
```

Create `src/app/shared/pipes/README.md`:
```markdown
# Shared Pipes

Cross-feature custom pipes live here.

## Convention
- One pipe per file, named `<purpose>.pipe.ts`.
- Standalone pipes only: `@Pipe({ name: 'foo' })`.

## Not yet implemented
Examples that would live here:
- `currency-cad.pipe.ts` — formats numbers as CAD with consistent locale.
- `relative-date.pipe.ts` — "3 days ago" formatting.

For now, Angular's built-in `currency` and `date` pipes handle our needs.
```

Create `src/app/shared/directives/README.md`:
```markdown
# Shared Directives

Cross-feature attribute and structural directives live here.

## Convention
- One directive per file, named `<purpose>.directive.ts`.
- Standalone directives only.

## Not yet implemented
Examples that would live here:
- `focus-trap.directive.ts` — trap focus inside a modal.
- `auto-grow.directive.ts` — auto-resize a textarea.
```

Create `src/app/shared/components/README.md`:
```markdown
# Shared Components

Cross-feature reusable presentational components live here once they are needed by two or more features.

## Promotion rule
A component starts inside `features/<X>/components/`. When a second feature needs it, move it here.

## Not yet implemented
This dashboard's current components are all feature-local. The `summary-card` could be promoted here in the future if profile or another feature reuses it.
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold feature-based folder structure with README stubs

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 2 — Data layer (Tasks 7–9)

### Task 7: Domain models

**Files:**
- Create: `src/app/core/models/client.model.ts`, `src/app/core/models/employee.model.ts`, `src/app/features/dashboard/models/project.model.ts`, `src/app/features/dashboard/models/time-entry.model.ts`, `src/app/features/dashboard/models/chart-data.model.ts`, `src/app/features/profile/models/profile.model.ts`, `src/app/features/login/models/credentials.model.ts`

- [ ] **Step 1: Create `client.model.ts`**

`src/app/core/models/client.model.ts`:
```ts
export interface Client {
  readonly id: string;
  readonly name: string;
  readonly claimPeriod: {
    readonly startDate: string;
    readonly endDate: string;
  };
  readonly province: string;
  readonly timeZone: string;
}
```

- [ ] **Step 2: Create `employee.model.ts`**

`src/app/core/models/employee.model.ts`:
```ts
export interface Employee {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hireDate: string;
  readonly annualSalary: number;
  readonly role: string;
}
```

- [ ] **Step 3: Create `project.model.ts`**

`src/app/features/dashboard/models/project.model.ts`:
```ts
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isSredEligible: boolean;
}
```

- [ ] **Step 4: Create `time-entry.model.ts`**

`src/app/features/dashboard/models/time-entry.model.ts`:
```ts
export interface TimeEntry {
  readonly id: string;
  readonly employeeId: string;
  readonly projectId: string;
  readonly date: string;
  readonly hours: number;
}
```

- [ ] **Step 5: Create `chart-data.model.ts`**

`src/app/features/dashboard/models/chart-data.model.ts`:
```ts
export type ChartMode = 'hours' | 'cost';

export interface ProjectBreakdownSeries {
  readonly name: string;
  readonly data: readonly number[];
}

export interface ProjectBreakdownData {
  readonly categories: readonly string[];
  readonly series: readonly ProjectBreakdownSeries[];
}

export interface AggregateDatum {
  readonly project: string;
  readonly value: number;
}

export interface AggregateData {
  readonly data: readonly AggregateDatum[];
  readonly grandTotal: number;
}

export interface EmployeeRow {
  readonly id: string;
  readonly name: string;
  readonly hireDate: string;
  readonly annualSalary: number;
  readonly hourlyRate: number;
  readonly ytdHours: number;
  readonly ytdCost: number;
}
```

- [ ] **Step 6: Create `profile.model.ts`**

`src/app/features/profile/models/profile.model.ts`:
```ts
import { Employee } from '../../../core/models/employee.model';

export interface Profile extends Employee {
  readonly avatarUrl?: string;
}
```

- [ ] **Step 7: Create `credentials.model.ts`**

`src/app/features/login/models/credentials.model.ts`:
```ts
export interface Credentials {
  readonly email: string;
  readonly password: string;
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add domain models for client, employee, project, time entry, chart data, profile, credentials

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: App-wide constants

**Files:**
- Create: `src/app/core/constants/app-constants.ts`

- [ ] **Step 1: Create constants file**

`src/app/core/constants/app-constants.ts`:
```ts
export const APP_CONSTANTS = {
  CURRENT_DATE: '2025-09-30',
  HOURS_PER_YEAR: 2000,
  LOCAL_STORAGE_KEYS: {
    AUTH_TOKEN: 'sredio.auth.token',
    AUTH_USER: 'sredio.auth.user',
  },
} as const;

export const ROUTES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add app-wide constants (current date, hours-per-year, route names, storage keys)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: Mock data files

**Files:**
- Create: `src/app/features/dashboard/mock/clients.mock.ts`, `employees.mock.ts`, `projects.mock.ts`, `time-entries.mock.ts`; `src/app/features/profile/mock/profile.mock.ts`

- [ ] **Step 1: Create `clients.mock.ts`**

`src/app/features/dashboard/mock/clients.mock.ts`:
```ts
import { Client } from '../../../core/models/client.model';

export const MOCK_CLIENT: Client = {
  id: 'client-001',
  name: 'Northwind Labs',
  claimPeriod: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
  province: 'ON',
  timeZone: 'EST',
};
```

- [ ] **Step 2: Create `employees.mock.ts`**

`src/app/features/dashboard/mock/employees.mock.ts`:
```ts
import { Employee } from '../../../core/models/employee.model';

export const MOCK_EMPLOYEES: readonly Employee[] = [
  { id: 'emp-001', name: 'Aria Chen',       email: 'aria@northwindlabs.ca',     hireDate: '2022-04-11', annualSalary:  92000, role: 'Senior Engineer' },
  { id: 'emp-002', name: 'Benjamin Patel',  email: 'ben@northwindlabs.ca',      hireDate: '2023-09-05', annualSalary:  72000, role: 'Engineer' },
  { id: 'emp-003', name: 'Camille Dubois',  email: 'camille@northwindlabs.ca',  hireDate: '2021-01-18', annualSalary: 118000, role: 'Staff Engineer' },
  { id: 'emp-004', name: 'Devon Singh',     email: 'devon@northwindlabs.ca',    hireDate: '2024-02-12', annualSalary:  56000, role: 'Junior Engineer' },
  { id: 'emp-005', name: 'Emiko Tanaka',    email: 'emiko@northwindlabs.ca',    hireDate: '2020-07-30', annualSalary: 105000, role: 'Senior Engineer' },
  { id: 'emp-006', name: 'Felix Okafor',    email: 'felix@northwindlabs.ca',    hireDate: '2023-03-22', annualSalary:  68000, role: 'Engineer' },
  { id: 'emp-007', name: 'Gianna Romano',   email: 'gianna@northwindlabs.ca',   hireDate: '2022-11-08', annualSalary:  85000, role: 'Senior Engineer' },
] as const;
```

- [ ] **Step 3: Create `projects.mock.ts`**

`src/app/features/dashboard/mock/projects.mock.ts`:
```ts
import { Project } from '../models/project.model';

export const MOCK_PROJECTS: readonly Project[] = [
  { id: 'proj-001', name: 'Rendering System',         description: 'Real-time WebGL rendering pipeline rewrite.',                    isSredEligible: true  },
  { id: 'proj-002', name: 'API Performance',          description: 'Latency reduction for the public REST API.',                     isSredEligible: true  },
  { id: 'proj-003', name: 'Mobile App Platform',      description: 'Native iOS/Android shell with cross-platform business logic.',   isSredEligible: true  },
  { id: 'proj-004', name: 'ML Inference Pipeline',    description: 'Custom inference runtime for tax-credit eligibility scoring.',   isSredEligible: true  },
  { id: 'proj-005', name: 'Unclaimed Work',           description: 'Internal tooling and operational work not eligible for SR&ED.',  isSredEligible: false },
] as const;
```

- [ ] **Step 4: Create `time-entries.mock.ts` (deterministic generator baked into the file)**

`src/app/features/dashboard/mock/time-entries.mock.ts`:
```ts
import { TimeEntry } from '../models/time-entry.model';

// Deterministic seeded RNG so the data is identical every run.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function generate(): readonly TimeEntry[] {
  const rng = makeRng(0xC0FFEE);
  const employees = ['emp-001','emp-002','emp-003','emp-004','emp-005','emp-006','emp-007'];
  // Each employee's project distribution weights (0..1). Some employees focus on certain projects.
  const weights: Record<string, readonly number[]> = {
    'emp-001': [0.45, 0.20, 0.05, 0.20, 0.10],
    'emp-002': [0.10, 0.50, 0.10, 0.20, 0.10],
    'emp-003': [0.30, 0.30, 0.10, 0.25, 0.05],
    'emp-004': [0.20, 0.15, 0.45, 0.10, 0.10],
    'emp-005': [0.05, 0.15, 0.10, 0.55, 0.15],
    'emp-006': [0.25, 0.25, 0.25, 0.10, 0.15],
    'emp-007': [0.35, 0.10, 0.20, 0.25, 0.10],
  };
  const projects = ['proj-001','proj-002','proj-003','proj-004','proj-005'];

  const start = new Date('2025-01-01').getTime();
  const end   = new Date('2025-09-30').getTime();
  const ms = 1000 * 60 * 60 * 24;

  const entries: TimeEntry[] = [];
  let id = 1;

  for (let t = start; t <= end; t += ms) {
    const d = new Date(t);
    const day = d.getUTCDay();
    if (day === 0 || day === 6) continue; // skip weekends

    for (const emp of employees) {
      // ~85% chance an employee logged any hours on a given weekday
      if (rng() > 0.85) continue;

      // Total hours that day (3..9)
      const totalHours = 3 + Math.floor(rng() * 7);
      // Split across 1..3 projects per day, weighted
      const projectsPicked = 1 + Math.floor(rng() * 3);
      const w = weights[emp];
      const picked = new Set<number>();
      while (picked.size < projectsPicked) {
        // weighted pick
        let r = rng();
        let idx = 0;
        for (; idx < projects.length - 1; idx++) {
          r -= w[idx];
          if (r <= 0) break;
        }
        picked.add(idx);
      }
      const pickedArr = [...picked];
      let remaining = totalHours;
      for (let i = 0; i < pickedArr.length; i++) {
        const isLast = i === pickedArr.length - 1;
        const hours = isLast ? remaining : Math.max(1, Math.floor((remaining / (pickedArr.length - i)) * (0.6 + rng() * 0.8)));
        remaining -= hours;
        if (hours <= 0) continue;
        entries.push({
          id: `te-${String(id++).padStart(6, '0')}`,
          employeeId: emp,
          projectId: projects[pickedArr[i]],
          date: d.toISOString().slice(0, 10),
          hours,
        });
      }
    }
  }

  return entries;
}

export const MOCK_TIME_ENTRIES: readonly TimeEntry[] = generate();
```

Note: the generator runs once at module load and the values are stable across runs because of the seeded RNG. This satisfies the "no `Math.random()` at runtime" constraint — `Math.random` is never called; only the seeded `rng()` is.

- [ ] **Step 5: Create `profile.mock.ts`**

`src/app/features/profile/mock/profile.mock.ts`:
```ts
import { Profile } from '../models/profile.model';

export const MOCK_PROFILE: Profile = {
  id: 'emp-001',
  name: 'Aria Chen',
  email: 'aria@northwindlabs.ca',
  hireDate: '2022-04-11',
  annualSalary: 92000,
  role: 'Senior Engineer',
};
```

- [ ] **Step 6: Verify everything still compiles**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add deterministic mock data for client, 7 employees, 5 projects, ~3500 time entries

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 3 — Calculations (TDD) (Tasks 10–14)

For every calculation file: write the spec first, run it to confirm it fails, implement, run to confirm it passes, commit.

### Task 10: `hourly-rate.ts` (TDD)

**Files:**
- Create test: `src/app/features/dashboard/calculations/hourly-rate.spec.ts`
- Create impl: `src/app/features/dashboard/calculations/hourly-rate.ts`

- [ ] **Step 1: Write failing tests**

`src/app/features/dashboard/calculations/hourly-rate.spec.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { hourlyRate, HOURS_PER_YEAR } from './hourly-rate';
import { Employee } from '../../../core/models/employee.model';

const make = (annualSalary: number): Employee => ({
  id: 'e1', name: 'X', email: 'x@x', hireDate: '2024-01-01', annualSalary, role: 'r',
});

describe('hourlyRate', () => {
  it('computes salary / 2000', () => {
    expect(hourlyRate(make(60000))).toBe(30);
  });

  it('returns zero for zero salary', () => {
    expect(hourlyRate(make(0))).toBe(0);
  });

  it('exposes HOURS_PER_YEAR = 2000', () => {
    expect(HOURS_PER_YEAR).toBe(2000);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- src/app/features/dashboard/calculations/hourly-rate.spec.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/app/features/dashboard/calculations/hourly-rate.ts`:
```ts
import { Employee } from '../../../core/models/employee.model';

export const HOURS_PER_YEAR = 2000;

export function hourlyRate(employee: Employee): number {
  return employee.annualSalary / HOURS_PER_YEAR;
}
```

- [ ] **Step 4: Run tests and verify pass**

```bash
npm test -- src/app/features/dashboard/calculations/hourly-rate.spec.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(calculations): hourly-rate with unit tests

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 11: `date-utils.ts` (TDD)

**Files:**
- Create test: `src/app/features/dashboard/calculations/date-utils.spec.ts`
- Create impl: `src/app/features/dashboard/calculations/date-utils.ts`

- [ ] **Step 1: Write failing tests**

`src/app/features/dashboard/calculations/date-utils.spec.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { daysBetween, daysElapsed } from './date-utils';

describe('daysBetween', () => {
  it('computes inclusive days between two dates', () => {
    expect(daysBetween('2025-01-01', '2025-01-01')).toBe(1);
    expect(daysBetween('2025-01-01', '2025-01-02')).toBe(2);
    expect(daysBetween('2025-01-01', '2025-12-31')).toBe(365);
  });

  it('throws on invalid date strings', () => {
    expect(() => daysBetween('not-a-date', '2025-01-01')).toThrow('Invalid date');
  });
});

describe('daysElapsed', () => {
  it('returns inclusive days from claim start to current date', () => {
    expect(daysElapsed('2025-01-01', '2025-01-01')).toBe(1);
    expect(daysElapsed('2025-01-01', '2025-09-30')).toBe(273);
  });

  it('returns 0 when current is before start', () => {
    expect(daysElapsed('2025-06-01', '2025-01-01')).toBe(0);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/app/features/dashboard/calculations/date-utils.spec.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/app/features/dashboard/calculations/date-utils.ts`:
```ts
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parse(iso: string): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) throw new Error(`Invalid date: ${iso}`);
  return t;
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = parse(startIso);
  const end = parse(endIso);
  if (end < start) return 0;
  return Math.round((end - start) / MS_PER_DAY) + 1;
}

export function daysElapsed(claimStartIso: string, currentDateIso: string): number {
  return daysBetween(claimStartIso, currentDateIso);
}
```

- [ ] **Step 4: Run and verify pass**

```bash
npm test -- src/app/features/dashboard/calculations/date-utils.spec.ts
```
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(calculations): date utilities (daysBetween, daysElapsed) with unit tests

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 12: `project-totals.ts` (TDD)

**Files:**
- Create test: `src/app/features/dashboard/calculations/project-totals.spec.ts`
- Create impl: `src/app/features/dashboard/calculations/project-totals.ts`

- [ ] **Step 1: Write failing tests**

`src/app/features/dashboard/calculations/project-totals.spec.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  employeeHoursOnProject,
  employeeCostOnProject,
  projectTotalHours,
  projectTotalCost,
} from './project-totals';
import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: id, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});

const entry = (id: string, employeeId: string, projectId: string, date: string, hours: number): TimeEntry => ({
  id, employeeId, projectId, date, hours,
});

const EMPLOYEES = [emp('a', 60000), emp('b', 120000)];
const ENTRIES: readonly TimeEntry[] = [
  entry('1', 'a', 'p1', '2025-01-15', 8),
  entry('2', 'a', 'p1', '2025-02-15', 4),
  entry('3', 'a', 'p2', '2025-02-20', 5),
  entry('4', 'b', 'p1', '2025-03-10', 6),
  entry('5', 'b', 'p2', '2025-04-01', 7),
  entry('6', 'a', 'p1', '2025-10-01', 9), // beyond asOf
];

describe('employeeHoursOnProject', () => {
  it('sums hours up to asOf inclusive', () => {
    expect(employeeHoursOnProject('a', 'p1', ENTRIES, '2025-09-30')).toBe(12);
  });

  it('returns 0 when employee has no hours on the project', () => {
    expect(employeeHoursOnProject('b', 'p3', ENTRIES, '2025-09-30')).toBe(0);
  });

  it('excludes entries after asOf', () => {
    expect(employeeHoursOnProject('a', 'p1', ENTRIES, '2025-03-01')).toBe(12); // 8+4
    expect(employeeHoursOnProject('a', 'p1', ENTRIES, '2025-01-31')).toBe(8);
  });
});

describe('employeeCostOnProject', () => {
  it('multiplies hours by hourly rate', () => {
    // 12 hours × ($60000/2000 = $30) = $360
    expect(employeeCostOnProject(EMPLOYEES[0], 'p1', ENTRIES, '2025-09-30')).toBe(360);
  });
});

describe('projectTotalHours', () => {
  it('sums all employees on a project', () => {
    // p1: a(12) + b(6) = 18
    expect(projectTotalHours('p1', ENTRIES, '2025-09-30')).toBe(18);
  });

  it('returns 0 for a project with no entries', () => {
    expect(projectTotalHours('p3', ENTRIES, '2025-09-30')).toBe(0);
  });
});

describe('projectTotalCost', () => {
  it('sums monetary cost across employees', () => {
    // p1: a(12 × 30 = 360) + b(6 × 60 = 360) = 720
    expect(projectTotalCost('p1', EMPLOYEES, ENTRIES, '2025-09-30')).toBe(720);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/app/features/dashboard/calculations/project-totals.spec.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/app/features/dashboard/calculations/project-totals.ts`:
```ts
import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';
import { hourlyRate } from './hourly-rate';

function isWithin(entry: TimeEntry, asOfIso: string): boolean {
  return entry.date <= asOfIso;
}

export function employeeHoursOnProject(
  employeeId: string,
  projectId: string,
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  let total = 0;
  for (const e of entries) {
    if (e.employeeId === employeeId && e.projectId === projectId && isWithin(e, asOfIso)) {
      total += e.hours;
    }
  }
  return total;
}

export function employeeCostOnProject(
  employee: Employee,
  projectId: string,
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  return employeeHoursOnProject(employee.id, projectId, entries, asOfIso) * hourlyRate(employee);
}

export function projectTotalHours(
  projectId: string,
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  let total = 0;
  for (const e of entries) {
    if (e.projectId === projectId && isWithin(e, asOfIso)) {
      total += e.hours;
    }
  }
  return total;
}

export function projectTotalCost(
  projectId: string,
  employees: readonly Employee[],
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  let total = 0;
  for (const emp of employees) {
    total += employeeCostOnProject(emp, projectId, entries, asOfIso);
  }
  return total;
}
```

- [ ] **Step 4: Run and verify pass**

```bash
npm test -- src/app/features/dashboard/calculations/project-totals.spec.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(calculations): project totals (hours and cost) with unit tests

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 13: `grand-totals.ts` (TDD)

**Files:**
- Create test: `src/app/features/dashboard/calculations/grand-totals.spec.ts`
- Create impl: `src/app/features/dashboard/calculations/grand-totals.ts`

- [ ] **Step 1: Write failing tests**

`src/app/features/dashboard/calculations/grand-totals.spec.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { grandTotalHours, grandTotalCost } from './grand-totals';
import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';

const emp = (id: string, salary: number): Employee => ({
  id, name: id, email: `${id}@x`, hireDate: '2024-01-01', annualSalary: salary, role: 'r',
});
const e = (id: string, employeeId: string, projectId: string, date: string, hours: number): TimeEntry =>
  ({ id, employeeId, projectId, date, hours });

const EMPLOYEES = [emp('a', 60000), emp('b', 120000)];
const ENTRIES = [
  e('1', 'a', 'p1', '2025-01-10', 4),
  e('2', 'a', 'p2', '2025-02-10', 6),
  e('3', 'b', 'p1', '2025-03-10', 3),
];

describe('grandTotalHours', () => {
  it('sums hours across all entries up to asOf', () => {
    expect(grandTotalHours(ENTRIES, '2025-09-30')).toBe(13);
  });

  it('returns 0 for empty entries', () => {
    expect(grandTotalHours([], '2025-09-30')).toBe(0);
  });
});

describe('grandTotalCost', () => {
  it('sums monetary cost across all employees and projects', () => {
    // a: (4+6) × 30 = 300
    // b: 3 × 60 = 180
    expect(grandTotalCost(EMPLOYEES, ENTRIES, '2025-09-30')).toBe(480);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/app/features/dashboard/calculations/grand-totals.spec.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/app/features/dashboard/calculations/grand-totals.ts`:
```ts
import { Employee } from '../../../core/models/employee.model';
import { TimeEntry } from '../models/time-entry.model';
import { hourlyRate } from './hourly-rate';

export function grandTotalHours(entries: readonly TimeEntry[], asOfIso: string): number {
  let total = 0;
  for (const e of entries) if (e.date <= asOfIso) total += e.hours;
  return total;
}

export function grandTotalCost(
  employees: readonly Employee[],
  entries: readonly TimeEntry[],
  asOfIso: string,
): number {
  const rateById = new Map<string, number>();
  for (const emp of employees) rateById.set(emp.id, hourlyRate(emp));

  let total = 0;
  for (const e of entries) {
    if (e.date > asOfIso) continue;
    const rate = rateById.get(e.employeeId);
    if (rate === undefined) continue;
    total += e.hours * rate;
  }
  return total;
}
```

- [ ] **Step 4: Run and verify pass**

```bash
npm test -- src/app/features/dashboard/calculations/grand-totals.spec.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(calculations): grand totals (hours and cost) with unit tests

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 14: `projections.ts` (TDD)

**Files:**
- Create test: `src/app/features/dashboard/calculations/projections.spec.ts`
- Create impl: `src/app/features/dashboard/calculations/projections.ts`
- Create barrel: `src/app/features/dashboard/calculations/index.ts`

- [ ] **Step 1: Write failing tests**

`src/app/features/dashboard/calculations/projections.spec.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { projectFullYear } from './projections';

describe('projectFullYear', () => {
  it('linearly extrapolates ytd to full year', () => {
    // claim 365 days, 90 elapsed, ytd 900 → projected = (900/90)*365 = 3650
    const out = projectFullYear(900, '2025-01-01', '2025-12-31', '2025-03-31');
    expect(out.projectedFullYear).toBe(3650);
    expect(out.remainder).toBe(2750);
  });

  it('returns ytd as projected when daysElapsed = 0', () => {
    const out = projectFullYear(500, '2025-06-01', '2025-12-31', '2025-01-01');
    expect(out.projectedFullYear).toBe(500);
    expect(out.remainder).toBe(0);
  });

  it('returns projected = ytd when currentDate >= endDate', () => {
    const out = projectFullYear(1000, '2025-01-01', '2025-12-31', '2025-12-31');
    expect(out.projectedFullYear).toBe(1000);
    expect(out.remainder).toBe(0);
  });

  it('handles zero ytd', () => {
    const out = projectFullYear(0, '2025-01-01', '2025-12-31', '2025-06-30');
    expect(out.projectedFullYear).toBe(0);
    expect(out.remainder).toBe(0);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/app/features/dashboard/calculations/projections.spec.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/app/features/dashboard/calculations/projections.ts`:
```ts
import { daysBetween, daysElapsed } from './date-utils';

export interface Projection {
  readonly projectedFullYear: number;
  readonly remainder: number;
}

export function projectFullYear(
  ytdValue: number,
  claimStartIso: string,
  claimEndIso: string,
  currentDateIso: string,
): Projection {
  const elapsed = daysElapsed(claimStartIso, currentDateIso);
  const total = daysBetween(claimStartIso, claimEndIso);

  if (elapsed === 0 || total === 0) {
    return { projectedFullYear: ytdValue, remainder: 0 };
  }

  if (currentDateIso >= claimEndIso) {
    return { projectedFullYear: ytdValue, remainder: 0 };
  }

  const projected = (ytdValue / elapsed) * total;
  return {
    projectedFullYear: projected,
    remainder: projected - ytdValue,
  };
}
```

- [ ] **Step 4: Run and verify pass**

```bash
npm test -- src/app/features/dashboard/calculations/projections.spec.ts
```
Expected: PASS.

- [ ] **Step 5: Create barrel**

`src/app/features/dashboard/calculations/index.ts`:
```ts
export * from './hourly-rate';
export * from './date-utils';
export * from './project-totals';
export * from './grand-totals';
export * from './projections';
```

- [ ] **Step 6: Run full test suite**

```bash
npm test
```
Expected: all calculation tests pass (typically 14+ tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(calculations): year-end linear projections with unit tests; export barrel

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 4 — Services (Tasks 15–16)

### Task 15: Dashboard data services (clients, employees, projects, time-entries)

**Files:**
- Create: `src/app/features/dashboard/services/{clients,employees,projects,time-entries}.service.ts`

- [ ] **Step 1: Create `clients.service.ts`**

`src/app/features/dashboard/services/clients.service.ts`:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client } from '../../../core/models/client.model';
import { MOCK_CLIENT } from '../mock/clients.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  getCurrent(): Observable<Client> {
    // PRODUCTION:
    // return this.http.get<Client>(`${environment.apiBaseUrl}/client`);

    // MOCK (until backend ready):
    if (environment.useMocks) {
      return of(MOCK_CLIENT).pipe(delay(200));
    }
    return this.http.get<Client>(`${environment.apiBaseUrl}/client`);
  }
}
```

- [ ] **Step 2: Create `employees.service.ts`**

`src/app/features/dashboard/services/employees.service.ts`:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Employee } from '../../../core/models/employee.model';
import { MOCK_EMPLOYEES } from '../mock/employees.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly Employee[]> {
    if (environment.useMocks) {
      return of(MOCK_EMPLOYEES).pipe(delay(250));
    }
    return this.http.get<readonly Employee[]>(`${environment.apiBaseUrl}/employees`);
  }
}
```

- [ ] **Step 3: Create `projects.service.ts`**

`src/app/features/dashboard/services/projects.service.ts`:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { MOCK_PROJECTS } from '../mock/projects.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly Project[]> {
    if (environment.useMocks) {
      return of(MOCK_PROJECTS).pipe(delay(200));
    }
    return this.http.get<readonly Project[]>(`${environment.apiBaseUrl}/projects`);
  }
}
```

- [ ] **Step 4: Create `time-entries.service.ts`**

`src/app/features/dashboard/services/time-entries.service.ts`:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TimeEntry } from '../models/time-entry.model';
import { MOCK_TIME_ENTRIES } from '../mock/time-entries.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimeEntriesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly TimeEntry[]> {
    if (environment.useMocks) {
      return of(MOCK_TIME_ENTRIES).pipe(delay(400));
    }
    return this.http.get<readonly TimeEntry[]>(`${environment.apiBaseUrl}/time-entries`);
  }
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: dashboard services (clients, employees, projects, time-entries) with Observable + delay mocks

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 16: ProfileService

**Files:**
- Create: `src/app/features/profile/services/profile.service.ts`

- [ ] **Step 1: Create the service**

`src/app/features/profile/services/profile.service.ts`:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Profile } from '../models/profile.model';
import { MOCK_PROFILE } from '../mock/profile.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  getCurrent(): Observable<Profile> {
    if (environment.useMocks) {
      return of(MOCK_PROFILE).pipe(delay(250));
    }
    return this.http.get<Profile>(`${environment.apiBaseUrl}/me`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: profile service with Observable + delay mock

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 5 — Auth (Tasks 17–19)

### Task 17: AuthService

**Files:**
- Create: `src/app/core/api/auth.service.ts`

- [ ] **Step 1: Create the service**

`src/app/core/api/auth.service.ts`:
```ts
import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Employee } from '../models/employee.model';
import { Credentials } from '../../features/login/models/credentials.model';
import { APP_CONSTANTS } from '../constants/app-constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _currentUser = signal<Employee | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(credentials: Credentials): Observable<void> {
    // PRODUCTION:
    // return this.http.post<{token: string; user: Employee}>(`${env.apiBaseUrl}/auth/login`, credentials)
    //   .pipe(tap(res => this.persist(res.token, res.user)), map(() => void 0));

    // MOCK: any email + password length >= 4 succeeds.
    if (!credentials.email || credentials.password.length < 4) {
      return throwError(() => new Error('Invalid email or password.'));
    }
    const fakeToken = `mock-token-${Date.now()}`;
    const fakeUser: Employee = {
      id: 'emp-001',
      name: 'Aria Chen',
      email: credentials.email,
      hireDate: '2022-04-11',
      annualSalary: 92000,
      role: 'Senior Engineer',
    };
    return of(void 0).pipe(
      delay(300),
      tap(() => this.persist(fakeToken, fakeUser)),
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER);
  }

  private persist(token: string, user: Employee): void {
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }

  private readUser(): Employee | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Employee;
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: AuthService with signals, mock login, localStorage rehydration

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 18: authGuard (functional CanActivateFn)

**Files:**
- Create: `src/app/core/guards/auth.guard.ts`

- [ ] **Step 1: Create the guard**

`src/app/core/guards/auth.guard.ts`:
```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../api/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: authGuard functional guard redirects unauthenticated users to /login

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 19: authInterceptor (functional HttpInterceptorFn)

**Files:**
- Create: `src/app/core/interceptors/auth.interceptor.ts`

- [ ] **Step 1: Create the interceptor**

`src/app/core/interceptors/auth.interceptor.ts`:
```ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../api/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token) return next(req);
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: authInterceptor functional HttpInterceptorFn attaches Bearer token

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 6 — App shell, routing, layouts (Tasks 20–24)

### Task 20: Wire up `app.config.ts` (zoneless, animations, router with hash, http with fetch + interceptor)

**Files:**
- Modify: `src/app/app.config.ts`

- [ ] **Step 1: Replace `app.config.ts`**

`src/app/app.config.ts`:
```ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

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

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: configure providers (zoneless, animations, hash routing, http + auth interceptor)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 21: NavBarComponent

**Files:**
- Create: `src/app/core/components/nav-bar/nav-bar.ts`, `nav-bar.html`, `nav-bar.scss`

- [ ] **Step 1: Create `nav-bar.ts`**

```ts
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Client } from '../../models/client.model';
import { AuthService } from '../../api/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {
  readonly client = input<Client | null>(null);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
```

- [ ] **Step 2: Create `nav-bar.html`**

```html
<nav class="bg-white border-b border-gray-200 px-6 py-3">
  <div class="flex items-center justify-between max-w-7xl mx-auto">
    <div class="flex items-center gap-8">
      <a routerLink="/dashboard" class="flex items-center gap-2 text-xl font-semibold text-blue-600">
        <span class="inline-block w-8 h-8 rounded bg-blue-600 text-white grid place-items-center text-sm">S</span>
        sred.io
      </a>
      <ul class="flex gap-1">
        <li>
          <a routerLink="/dashboard"
             routerLinkActive="bg-blue-50 text-blue-700"
             class="px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100">
            Dashboard
          </a>
        </li>
        <li>
          <a routerLink="/profile"
             routerLinkActive="bg-blue-50 text-blue-700"
             class="px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100">
            Profile
          </a>
        </li>
      </ul>
    </div>
    <div class="flex items-center gap-6 text-sm">
      @if (client(); as c) {
        <div class="flex flex-col items-end leading-tight">
          <span class="font-medium text-gray-900">{{ c.name }}</span>
          <span class="text-gray-500">{{ c.claimPeriod.startDate }} → {{ c.claimPeriod.endDate }} ({{ c.timeZone }})</span>
        </div>
      }
      @if (currentUser(); as u) {
        <span class="text-gray-700">{{ u.name }}</span>
      }
      <button type="button"
              (click)="logout()"
              class="px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
        Logout
      </button>
    </div>
  </div>
</nav>
```

- [ ] **Step 3: Create empty `nav-bar.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: NavBarComponent with router links, active state, logout

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 22: AuthenticatedLayoutComponent

**Files:**
- Create: `src/app/core/components/authenticated-layout/authenticated-layout.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `authenticated-layout.ts`**

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavBarComponent } from '../nav-bar/nav-bar';
import { ClientsService } from '../../../features/dashboard/services/clients.service';

@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent {
  private readonly clients = inject(ClientsService);
  readonly client = toSignal(this.clients.getCurrent(), { initialValue: null });
}
```

- [ ] **Step 2: Create `authenticated-layout.html`**

```html
<app-nav-bar [client]="client()" />
<main class="max-w-7xl mx-auto px-6 py-8">
  <router-outlet />
</main>
```

- [ ] **Step 3: Create `authenticated-layout.scss`**

```scss
:host { display: block; min-height: 100vh; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: AuthenticatedLayoutComponent wraps protected routes with NavBar

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 23: GuestLayoutComponent

**Files:**
- Create: `src/app/core/components/guest-layout/guest-layout.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `guest-layout.ts`**

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  imports: [RouterOutlet],
  templateUrl: './guest-layout.html',
  styleUrl: './guest-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestLayoutComponent {}
```

- [ ] **Step 2: Create `guest-layout.html`**

```html
<div class="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <span class="inline-block w-12 h-12 rounded bg-blue-600 text-white grid place-items-center text-lg font-semibold">S</span>
      <h1 class="mt-3 text-2xl font-semibold text-gray-900">sred.io</h1>
      <p class="text-sm text-gray-500">SR&amp;ED Financial Dashboard</p>
    </div>
    <router-outlet />
  </div>
</div>
```

- [ ] **Step 3: Create `guest-layout.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: GuestLayoutComponent wraps /login with centered card chrome

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 24: app.routes.ts (nested layout config) + AppComponent (initFlowbite on NavigationEnd)

**Files:**
- Modify: `src/app/app.routes.ts`, `src/app/app.ts`, `src/app/app.html`

- [ ] **Step 1: Update `app.routes.ts`**

`src/app/app.routes.ts`:
```ts
import { Routes } from '@angular/router';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout';
import { GuestLayoutComponent } from './core/components/guest-layout/guest-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then(m => m.ProfileComponent),
      },
    ],
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/login/login').then(m => m.LoginComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
```

- [ ] **Step 2: Update `app.ts`**

`src/app/app.ts`:
```ts
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  private readonly navEnd = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      this.navEnd();
      queueMicrotask(() => initFlowbite());
    });
  }
}
```

If the existing class is named `AppComponent` instead of `App`, keep its current name and update the rest of the codebase accordingly. Angular 21's `ng new` exports `App` by default.

- [ ] **Step 3: Update `app.html`**

```html
<router-outlet />
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: succeeds. (`DashboardComponent`, `ProfileComponent`, `LoginComponent` don't exist yet — `loadComponent` is lazy so build succeeds, but they will fail to load at runtime until Tasks 25, 32, 35 are done.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: route config with nested layouts and authGuard; wire initFlowbite on NavigationEnd

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 7 — Login (Task 25)

### Task 25: LoginComponent (Reactive Form, mock login, redirect)

**Files:**
- Create: `src/app/features/login/login.ts`, `login.html`, `login.scss`

- [ ] **Step 1: Create `login.ts`**

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/api/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: err => {
        this.errorMessage.set(err.message ?? 'Login failed.');
        this.isSubmitting.set(false);
      },
    });
  }
}
```

Note: this is the only place a `.subscribe()` is acceptable — it's an imperative form submission and we need the success/error callbacks. The PRD constraint is "no `subscribe()` in components for data" — submission side-effects are not data subscriptions.

- [ ] **Step 2: Create `login.html`**

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
  <h2 class="text-xl font-semibold text-gray-900 mb-6">Sign in</h2>

  @if (errorMessage(); as msg) {
    <div class="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
      {{ msg }}
    </div>
  }

  <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input id="email"
             type="email"
             formControlName="email"
             autocomplete="email"
             class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p class="text-xs text-red-600 mt-1">A valid email is required.</p>
      }
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <input id="password"
             type="password"
             formControlName="password"
             autocomplete="current-password"
             class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      @if (form.controls.password.touched && form.controls.password.invalid) {
        <p class="text-xs text-red-600 mt-1">Password must be at least 4 characters.</p>
      }
    </div>

    <button type="submit"
            [disabled]="isSubmitting()"
            class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 disabled:opacity-50">
      {{ isSubmitting() ? 'Signing in…' : 'Sign in' }}
    </button>

    <p class="text-xs text-gray-500 mt-2 text-center">Any email and a 4+ character password will sign you in (mock auth).</p>
  </form>
</div>
```

- [ ] **Step 3: Create `login.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Smoke test**

```bash
npm start
```
Navigate to `http://localhost:4200/#/login`. Expected: login form renders inside the centered guest layout. Filling email + password ≥ 4 chars and submitting should redirect to `/dashboard` (which will fail to load since Dashboard component isn't built yet — that's expected).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: LoginComponent with reactive form, validation, mock login, redirect

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 8 — Dashboard components (Tasks 26–32)

### Task 26: ClientHeaderComponent

**Files:**
- Create: `src/app/features/dashboard/components/client-header/client-header.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `client-header.ts`**

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-header',
  imports: [],
  templateUrl: './client-header.html',
  styleUrl: './client-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderComponent {
  readonly client = input<Client | null>(null);
  readonly isLoading = input(false);
}
```

- [ ] **Step 2: Create `client-header.html`**

```html
<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  @if (isLoading() || !client()) {
    <div class="animate-pulse space-y-2">
      <div class="h-6 bg-gray-200 rounded w-1/3"></div>
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  } @else if (client(); as c) {
    <div class="flex items-baseline justify-between flex-wrap gap-2">
      <h1 class="text-2xl font-semibold text-gray-900">{{ c.name }}</h1>
      <div class="text-sm text-gray-600">
        Claim period <span class="font-medium">{{ c.claimPeriod.startDate }}</span> →
        <span class="font-medium">{{ c.claimPeriod.endDate }}</span>
        · Province <span class="font-medium">{{ c.province }}</span>
      </div>
    </div>
  }
</section>
```

- [ ] **Step 3: Create `client-header.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ClientHeaderComponent with loading skeleton

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 27: SummaryCardComponent

**Files:**
- Create: `src/app/features/dashboard/components/summary-card/summary-card.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `summary-card.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

export type CardFormat = 'currency' | 'number';
export type CardTone = 'neutral' | 'projected';

@Component({
  selector: 'app-summary-card',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly format = input<CardFormat>('number');
  readonly tone = input<CardTone>('neutral');
  readonly isLoading = input(false);

  readonly toneClasses = computed(() =>
    this.tone() === 'projected'
      ? 'border-l-4 border-blue-500'
      : 'border-l-4 border-gray-300',
  );
}
```

- [ ] **Step 2: Create `summary-card.html`**

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 {{ toneClasses() }}">
  <div class="text-xs uppercase tracking-wide text-gray-500 font-medium">{{ label() }}</div>
  @if (isLoading()) {
    <div class="mt-2 h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
  } @else {
    <div class="mt-1 text-2xl font-semibold text-gray-900">
      @if (format() === 'currency') {
        {{ value() | currency:'CAD':'symbol-narrow':'1.0-0' }}
      } @else {
        {{ value() | number:'1.0-0' }}
      }
    </div>
  }
</div>
```

- [ ] **Step 3: Create `summary-card.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: SummaryCardComponent (reusable card with currency/number format and tone)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 28: HoursCostToggleComponent

**Files:**
- Create: `src/app/features/dashboard/components/hours-cost-toggle/hours-cost-toggle.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `hours-cost-toggle.ts`**

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChartMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-hours-cost-toggle',
  imports: [],
  templateUrl: './hours-cost-toggle.html',
  styleUrl: './hours-cost-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoursCostToggleComponent {
  readonly mode = input<ChartMode>('hours');
  readonly modeChange = output<ChartMode>();

  select(next: ChartMode): void {
    if (next !== this.mode()) this.modeChange.emit(next);
  }
}
```

- [ ] **Step 2: Create `hours-cost-toggle.html`**

```html
<div role="group" class="inline-flex rounded-md shadow-sm bg-white border border-gray-200 p-0.5">
  <button type="button"
          (click)="select('hours')"
          [class.bg-blue-600]="mode() === 'hours'"
          [class.text-white]="mode() === 'hours'"
          [class.text-gray-700]="mode() !== 'hours'"
          class="px-4 py-1.5 text-sm font-medium rounded">
    Hours
  </button>
  <button type="button"
          (click)="select('cost')"
          [class.bg-blue-600]="mode() === 'cost'"
          [class.text-white]="mode() === 'cost'"
          [class.text-gray-700]="mode() !== 'cost'"
          class="px-4 py-1.5 text-sm font-medium rounded">
    Cost
  </button>
</div>
```

- [ ] **Step 3: Create `hours-cost-toggle.scss`**

```scss
:host { display: inline-block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: HoursCostToggleComponent (segmented control emitting modeChange)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 29: ProjectBreakdownChartComponent (ApexCharts stacked bar)

**Files:**
- Create: `src/app/features/dashboard/components/project-breakdown-chart/project-breakdown-chart.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `project-breakdown-chart.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule, ApexAxisChartSeries, ApexOptions } from 'ng-apexcharts';
import { ChartMode, ProjectBreakdownData } from '../../models/chart-data.model';

@Component({
  selector: 'app-project-breakdown-chart',
  imports: [NgApexchartsModule],
  templateUrl: './project-breakdown-chart.html',
  styleUrl: './project-breakdown-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectBreakdownChartComponent {
  readonly data = input.required<ProjectBreakdownData>();
  readonly mode = input.required<ChartMode>();
  readonly isLoading = input(false);

  readonly series = computed<ApexAxisChartSeries>(() =>
    this.data().series.map(s => ({ name: s.name, data: [...s.data] })),
  );

  readonly options = computed<ApexOptions>(() => ({
    chart: {
      type: 'bar',
      stacked: true,
      height: 360,
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: [...this.data().categories] },
    yaxis: {
      title: { text: this.mode() === 'hours' ? 'Hours' : 'Cost (CAD)' },
      labels: {
        formatter: (v: number) =>
          this.mode() === 'cost'
            ? `$${Math.round(v).toLocaleString('en-CA')}`
            : v.toLocaleString('en-CA'),
      },
    },
    legend: { position: 'bottom' },
    tooltip: {
      y: {
        formatter: (v: number) =>
          this.mode() === 'cost'
            ? `$${Math.round(v).toLocaleString('en-CA')}`
            : `${v.toLocaleString('en-CA')} hrs`,
      },
    },
    fill: { opacity: 0.92 },
  }));
}
```

- [ ] **Step 2: Create `project-breakdown-chart.html`**

```html
<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
  <h3 class="text-base font-semibold text-gray-900 mb-3">Per-project breakdown by employee</h3>
  @if (isLoading()) {
    <div class="h-[360px] animate-pulse bg-gray-100 rounded"></div>
  } @else {
    <apx-chart [series]="series()"
               [chart]="options().chart!"
               [plotOptions]="options().plotOptions!"
               [dataLabels]="options().dataLabels!"
               [xaxis]="options().xaxis!"
               [yaxis]="options().yaxis!"
               [legend]="options().legend!"
               [tooltip]="options().tooltip!"
               [fill]="options().fill!" />
  }
</section>
```

- [ ] **Step 3: Create `project-breakdown-chart.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ProjectBreakdownChartComponent (ApexCharts stacked vertical bar, mode-aware)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 30: AggregateChartComponent (ApexCharts horizontal bar)

**Files:**
- Create: `src/app/features/dashboard/components/aggregate-chart/aggregate-chart.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `aggregate-chart.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgApexchartsModule, ApexAxisChartSeries, ApexOptions } from 'ng-apexcharts';
import { AggregateData, ChartMode } from '../../models/chart-data.model';

@Component({
  selector: 'app-aggregate-chart',
  imports: [NgApexchartsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './aggregate-chart.html',
  styleUrl: './aggregate-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregateChartComponent {
  readonly data = input.required<AggregateData>();
  readonly mode = input.required<ChartMode>();
  readonly isLoading = input(false);

  readonly series = computed<ApexAxisChartSeries>(() => [{
    name: this.mode() === 'hours' ? 'Hours' : 'Cost',
    data: this.data().data.map(d => d.value),
  }]);

  readonly options = computed<ApexOptions>(() => ({
    chart: {
      type: 'bar',
      height: 320,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: { horizontal: true, barHeight: '55%', borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: this.data().data.map(d => d.project),
      labels: {
        formatter: (v: string) => {
          const n = Number(v);
          if (Number.isNaN(n)) return v;
          return this.mode() === 'cost'
            ? `$${Math.round(n).toLocaleString('en-CA')}`
            : n.toLocaleString('en-CA');
        },
      },
    },
    legend: { show: false },
    colors: ['#2563eb'],
    tooltip: {
      y: {
        formatter: (v: number) =>
          this.mode() === 'cost'
            ? `$${Math.round(v).toLocaleString('en-CA')}`
            : `${v.toLocaleString('en-CA')} hrs`,
      },
    },
  }));
}
```

- [ ] **Step 2: Create `aggregate-chart.html`**

```html
<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
  <h3 class="text-base font-semibold text-gray-900 mb-3">Project totals</h3>
  @if (isLoading()) {
    <div class="h-[320px] animate-pulse bg-gray-100 rounded"></div>
  } @else {
    <apx-chart [series]="series()"
               [chart]="options().chart!"
               [plotOptions]="options().plotOptions!"
               [dataLabels]="options().dataLabels!"
               [xaxis]="options().xaxis!"
               [legend]="options().legend!"
               [colors]="options().colors!"
               [tooltip]="options().tooltip!" />
    <div class="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-3">
      <span class="text-sm text-gray-500">Grand total</span>
      <span class="text-xl font-semibold text-gray-900">
        @if (mode() === 'cost') {
          {{ data().grandTotal | currency:'CAD':'symbol-narrow':'1.0-0' }}
        } @else {
          {{ data().grandTotal | number:'1.0-0' }} hrs
        }
      </span>
    </div>
  }
</section>
```

- [ ] **Step 3: Create `aggregate-chart.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: AggregateChartComponent (ApexCharts horizontal bar with grand total footer)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 31: EmployeeGridComponent (hand-rolled signal sort)

**Files:**
- Create: `src/app/features/dashboard/components/employee-grid/employee-grid.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `employee-grid.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeeRow } from '../../models/chart-data.model';

type SortableCol = keyof Pick<EmployeeRow, 'name' | 'hireDate' | 'annualSalary' | 'hourlyRate' | 'ytdHours' | 'ytdCost'>;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-employee-grid',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './employee-grid.html',
  styleUrl: './employee-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeGridComponent {
  readonly rows = input.required<readonly EmployeeRow[]>();
  readonly isLoading = input(false);

  readonly sortCol = signal<SortableCol>('name');
  readonly sortDir = signal<SortDir>('asc');

  readonly sortedRows = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.rows()].sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  toggleSort(col: SortableCol): void {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  sortIndicator(col: SortableCol): string {
    if (this.sortCol() !== col) return '';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }
}
```

- [ ] **Step 2: Create `employee-grid.html`**

```html
<section class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <div class="px-5 py-4 border-b border-gray-100">
    <h3 class="text-base font-semibold text-gray-900">Employees</h3>
  </div>

  @if (isLoading()) {
    <div class="p-5 space-y-2">
      @for (i of [0,1,2,3,4]; track i) {
        <div class="h-8 bg-gray-100 rounded animate-pulse"></div>
      }
    </div>
  } @else {
    <table class="w-full text-sm text-left">
      <thead class="bg-gray-50 text-xs uppercase text-gray-600">
        <tr>
          <th class="px-5 py-3 cursor-pointer select-none" (click)="toggleSort('name')">
            Name <span>{{ sortIndicator('name') }}</span>
          </th>
          <th class="px-5 py-3 cursor-pointer select-none" (click)="toggleSort('hireDate')">
            Hire date <span>{{ sortIndicator('hireDate') }}</span>
          </th>
          <th class="px-5 py-3 cursor-pointer select-none text-right" (click)="toggleSort('annualSalary')">
            Annual salary <span>{{ sortIndicator('annualSalary') }}</span>
          </th>
          <th class="px-5 py-3 cursor-pointer select-none text-right" (click)="toggleSort('hourlyRate')">
            Hourly rate <span>{{ sortIndicator('hourlyRate') }}</span>
          </th>
          <th class="px-5 py-3 cursor-pointer select-none text-right" (click)="toggleSort('ytdHours')">
            YTD hours <span>{{ sortIndicator('ytdHours') }}</span>
          </th>
          <th class="px-5 py-3 cursor-pointer select-none text-right" (click)="toggleSort('ytdCost')">
            YTD cost <span>{{ sortIndicator('ytdCost') }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        @for (row of sortedRows(); track row.id) {
          <tr class="hover:bg-gray-50">
            <td class="px-5 py-3 font-medium text-gray-900">{{ row.name }}</td>
            <td class="px-5 py-3 text-gray-600">{{ row.hireDate }}</td>
            <td class="px-5 py-3 text-right">{{ row.annualSalary | currency:'CAD':'symbol-narrow':'1.0-0' }}</td>
            <td class="px-5 py-3 text-right">{{ row.hourlyRate | currency:'CAD':'symbol-narrow':'1.2-2' }}</td>
            <td class="px-5 py-3 text-right">{{ row.ytdHours | number:'1.0-0' }}</td>
            <td class="px-5 py-3 text-right">{{ row.ytdCost | currency:'CAD':'symbol-narrow':'1.0-0' }}</td>
          </tr>
        }
      </tbody>
    </table>
  }
</section>
```

- [ ] **Step 3: Create `employee-grid.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: EmployeeGridComponent with hand-rolled signal-based column sort

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 32: DashboardComponent (composition)

**Files:**
- Create: `src/app/features/dashboard/dashboard.ts`, `dashboard.html`, `dashboard.scss`

- [ ] **Step 1: Create `dashboard.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClientsService } from './services/clients.service';
import { EmployeesService } from './services/employees.service';
import { ProjectsService } from './services/projects.service';
import { TimeEntriesService } from './services/time-entries.service';
import { ClientHeaderComponent } from './components/client-header/client-header';
import { SummaryCardComponent } from './components/summary-card/summary-card';
import { HoursCostToggleComponent } from './components/hours-cost-toggle/hours-cost-toggle';
import { ProjectBreakdownChartComponent } from './components/project-breakdown-chart/project-breakdown-chart';
import { AggregateChartComponent } from './components/aggregate-chart/aggregate-chart';
import { EmployeeGridComponent } from './components/employee-grid/employee-grid';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
import {
  hourlyRate,
  projectTotalHours,
  projectTotalCost,
  grandTotalHours,
  grandTotalCost,
  employeeHoursOnProject,
  employeeCostOnProject,
  projectFullYear,
} from './calculations';
import {
  AggregateData,
  ChartMode,
  EmployeeRow,
  ProjectBreakdownData,
} from './models/chart-data.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    ClientHeaderComponent,
    SummaryCardComponent,
    HoursCostToggleComponent,
    ProjectBreakdownChartComponent,
    AggregateChartComponent,
    EmployeeGridComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly clientsSvc = inject(ClientsService);
  private readonly employeesSvc = inject(EmployeesService);
  private readonly projectsSvc = inject(ProjectsService);
  private readonly timeEntriesSvc = inject(TimeEntriesService);

  readonly client = toSignal(this.clientsSvc.getCurrent(), { initialValue: null });
  readonly employees = toSignal(this.employeesSvc.getAll(), { initialValue: [] as readonly any[] });
  readonly projects = toSignal(this.projectsSvc.getAll(), { initialValue: [] as readonly any[] });
  readonly timeEntries = toSignal(this.timeEntriesSvc.getAll(), { initialValue: [] as readonly any[] });

  readonly mode = signal<ChartMode>('hours');

  readonly isLoading = computed(() =>
    !this.client() ||
    this.employees().length === 0 ||
    this.projects().length === 0 ||
    this.timeEntries().length === 0,
  );

  readonly asOf = APP_CONSTANTS.CURRENT_DATE;

  readonly ytdTotalHours = computed(() =>
    grandTotalHours(this.timeEntries(), this.asOf),
  );

  readonly ytdTotalCost = computed(() =>
    grandTotalCost(this.employees(), this.timeEntries(), this.asOf),
  );

  readonly projectedFullYearHours = computed(() => {
    const c = this.client();
    if (!c) return 0;
    return projectFullYear(this.ytdTotalHours(), c.claimPeriod.startDate, c.claimPeriod.endDate, this.asOf).projectedFullYear;
  });

  readonly projectedFullYearCost = computed(() => {
    const c = this.client();
    if (!c) return 0;
    return projectFullYear(this.ytdTotalCost(), c.claimPeriod.startDate, c.claimPeriod.endDate, this.asOf).projectedFullYear;
  });

  readonly projectsBreakdown = computed<ProjectBreakdownData>(() => {
    const projects = this.projects();
    const employees = this.employees();
    const entries = this.timeEntries();
    const isCost = this.mode() === 'cost';

    return {
      categories: projects.map(p => p.name),
      series: employees.map(emp => ({
        name: emp.name,
        data: projects.map(p =>
          isCost
            ? employeeCostOnProject(emp, p.id, entries, this.asOf)
            : employeeHoursOnProject(emp.id, p.id, entries, this.asOf),
        ),
      })),
    };
  });

  readonly aggregateData = computed<AggregateData>(() => {
    const projects = this.projects();
    const entries = this.timeEntries();
    const employees = this.employees();
    const isCost = this.mode() === 'cost';

    const data = projects.map(p => ({
      project: p.name,
      value: isCost
        ? projectTotalCost(p.id, employees, entries, this.asOf)
        : projectTotalHours(p.id, entries, this.asOf),
    }));
    const grandTotal = isCost ? this.ytdTotalCost() : this.ytdTotalHours();
    return { data, grandTotal };
  });

  readonly employeeRows = computed<readonly EmployeeRow[]>(() => {
    const entries = this.timeEntries();
    const projects = this.projects();
    return this.employees().map(emp => {
      const ytdHours = projects.reduce((sum, p) => sum + employeeHoursOnProject(emp.id, p.id, entries, this.asOf), 0);
      const rate = hourlyRate(emp);
      return {
        id: emp.id,
        name: emp.name,
        hireDate: emp.hireDate,
        annualSalary: emp.annualSalary,
        hourlyRate: rate,
        ytdHours,
        ytdCost: ytdHours * rate,
      };
    });
  });

  onModeChange(next: ChartMode): void {
    this.mode.set(next);
  }
}
```

- [ ] **Step 2: Create `dashboard.html`**

```html
<div class="space-y-6">
  <app-client-header [client]="client()" [isLoading]="isLoading()" />

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <app-summary-card label="YTD Total Hours"
                      [value]="ytdTotalHours()"
                      format="number"
                      tone="neutral"
                      [isLoading]="isLoading()" />
    <app-summary-card label="YTD Total Cost"
                      [value]="ytdTotalCost()"
                      format="currency"
                      tone="neutral"
                      [isLoading]="isLoading()" />
    <app-summary-card label="Projected Full Year Hours"
                      [value]="projectedFullYearHours()"
                      format="number"
                      tone="projected"
                      [isLoading]="isLoading()" />
    <app-summary-card label="Projected Full Year Cost"
                      [value]="projectedFullYearCost()"
                      format="currency"
                      tone="projected"
                      [isLoading]="isLoading()" />
  </div>

  <div class="flex items-center justify-end">
    <app-hours-cost-toggle [mode]="mode()" (modeChange)="onModeChange($event)" />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <app-project-breakdown-chart [data]="projectsBreakdown()"
                                 [mode]="mode()"
                                 [isLoading]="isLoading()" />
    <app-aggregate-chart [data]="aggregateData()"
                         [mode]="mode()"
                         [isLoading]="isLoading()" />
  </div>

  <app-employee-grid [rows]="employeeRows()" [isLoading]="isLoading()" />
</div>
```

- [ ] **Step 3: Create `dashboard.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Smoke test full app**

```bash
npm start
```
1. Open `http://localhost:4200`. Expect redirect to `/login` (no token).
2. Sign in with any email + a password ≥ 4 chars. Expect redirect to `/dashboard`.
3. Verify all 4 summary cards populate after ~400ms (loading skeletons first).
4. Verify both charts render. Toggle Hours/Cost — both charts re-render and Y-axis labels switch between numeric and CAD.
5. Verify Employee grid renders 7 rows. Click each column header — verify sort indicator appears and direction flips on second click.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: DashboardComponent composes all dashboard pieces with computed derivations

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 9 — Profile (Tasks 33–34)

### Task 33: ProfileCardComponent

**Files:**
- Create: `src/app/features/profile/components/profile-card/profile-card.ts`, `.html`, `.scss`

- [ ] **Step 1: Create `profile-card.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Profile } from '../../models/profile.model';
import { hourlyRate } from '../../../dashboard/calculations';

@Component({
  selector: 'app-profile-card',
  imports: [CurrencyPipe],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
  readonly profile = input<Profile | null>(null);
  readonly isLoading = input(false);

  readonly hourly = computed(() => {
    const p = this.profile();
    return p ? hourlyRate(p) : 0;
  });
}
```

- [ ] **Step 2: Create `profile-card.html`**

```html
<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
  @if (isLoading() || !profile()) {
    <div class="animate-pulse space-y-3">
      <div class="h-6 bg-gray-200 rounded w-1/3"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  } @else if (profile(); as p) {
    <div class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">{{ p.name }}</h2>
        <p class="text-sm text-gray-500">{{ p.role }}</p>
        <p class="text-sm text-gray-600 mt-2">{{ p.email }}</p>
      </div>
      <div class="text-right text-sm text-gray-500">Joined<br /><span class="text-gray-900 font-medium">{{ p.hireDate }}</span></div>
    </div>

    <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
      <div>
        <dt class="text-gray-500">Annual salary</dt>
        <dd class="text-gray-900 font-medium">{{ p.annualSalary | currency:'CAD':'symbol-narrow':'1.0-0' }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Hourly rate</dt>
        <dd class="text-gray-900 font-medium">{{ hourly() | currency:'CAD':'symbol-narrow':'1.2-2' }}</dd>
      </div>
    </dl>
  }
</section>
```

- [ ] **Step 3: Create `profile-card.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ProfileCardComponent with derived hourly rate and skeleton loading

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 34: ProfileComponent

**Files:**
- Create: `src/app/features/profile/profile.ts`, `profile.html`, `profile.scss`

- [ ] **Step 1: Create `profile.ts`**

```ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileService } from './services/profile.service';
import { ProfileCardComponent } from './components/profile-card/profile-card';

@Component({
  selector: 'app-profile',
  imports: [ProfileCardComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly profileSvc = inject(ProfileService);
  readonly profile = toSignal(this.profileSvc.getCurrent(), { initialValue: null });
  readonly isLoading = computed(() => this.profile() === null);
}
```

- [ ] **Step 2: Create `profile.html`**

```html
<div class="space-y-4">
  <h1 class="text-2xl font-semibold text-gray-900">Profile</h1>
  <app-profile-card [profile]="profile()" [isLoading]="isLoading()" />
</div>
```

- [ ] **Step 3: Create `profile.scss`**

```scss
:host { display: block; }
```

- [ ] **Step 4: Smoke test**

```bash
npm start
```
Sign in, then navigate to `/profile` via the nav bar. Expect Profile card to render with the mock employee's data.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ProfileComponent renders ProfileCard from ProfileService signal

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 10 — Docs and deployment (Tasks 35–38)

### Task 35: CLAUDE.md (architectural constitution)

**Files:**
- Create: `CLAUDE.md` (repo root)

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
# CLAUDE.md — Architectural Constitution

This document is binding for any future change to this codebase, by humans or AI. It exists because the project's review meeting will probe every architectural decision.

## Persona for AI workers
A senior Angular 21 engineer who reaches for signals, OnPush, standalone components, and pure functions before reaching for classes or RxJS. Prefers small files with one responsibility.

## Hard rules (do not violate)

- Angular 21+, standalone components, `ChangeDetectionStrategy.OnPush` on every component.
- Do NOT set `standalone: true` inside `@Component` / `@Directive` / `@Pipe` decorators — it has been the default since Angular 19.
- Zoneless change detection (`provideZonelessChangeDetection()`).
- All DI via `inject()`. No constructor injection.
- All inputs via `input()` / `input.required()`. No `@Input` decorator.
- All outputs via `output()`. No `@Output` / `EventEmitter` directly.
- All control flow via `@if` / `@for` / `@switch`. No `*ngIf`, `*ngFor`, `*ngSwitch`.
- `@for` blocks MUST include a `track` expression.
- Signals + `computed()` for derived state. Bridge Observables with `toSignal()`.
- No `subscribe()` for data flow inside components — `toSignal()` or the `async` pipe. (The Login form's submit handler is the only exception: it's an imperative side-effect, not a data subscription.)
- TypeScript strict; no `any`. Use `unknown` and narrow.
- Pure functions for math (`features/dashboard/calculations/`). No classes around pure functions.
- Functional `CanActivateFn` and `HttpInterceptorFn` only. No class-based guards/interceptors.
- String literal union types over `enum` (e.g., `type ChartMode = 'hours' | 'cost'`).
- Do NOT use `@HostBinding` / `@HostListener` — use the `host` object in the decorator.
- Do NOT use `ngClass` / `ngStyle` — use `[class.foo]` / `[style.color]` bindings.
- File names: drop the `.component.` suffix (`nav-bar.ts`, not `nav-bar.component.ts`).
- All component fields that hold signals, computeds, or injected services are `readonly`.

## Folder rules

- `core/` — cross-cutting. Auth, layouts, nav, shared models, constants, guards, interceptors.
- `features/<X>/` — self-contained feature. Page component, services, calculations, models, mock data.
- `shared/` — promoted-from-feature reusable UI (pipes, directives, dumb components).
- Promotion rule: keep new things feature-local. When two features need the same thing, move it to `shared/` (UI) or `core/` (models, singletons).
- `features/<X>/calculations/` is for pure-math modules only. Display formatters and UI helpers belong in `shared/pipes/` or in component-local code.

## Testing rules

- Calculations are TDD: write the spec, run it to confirm failure, implement, run to confirm pass.
- Component tests are nice-to-have at this scale. The Vitest config is in `vitest.config.ts`.

## Mock and environment rules

- Services return `Observable<T>` shaped the same way the real API would. In `useMocks` mode they emit from a seeded mock with `delay()`. Swap to `http.get(...)` is a one-line change.
- `environment.ts` (dev), `environment.staging.ts`, `environment.prod.ts` are swapped via `angular.json` `fileReplacements`.

## Reference

- Angular best practices: https://angular.dev/style-guide
- Angular llms.txt: https://angular.dev/llms.txt
- Angular llms-full.txt: https://angular.dev/llms-full.txt
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md as architectural constitution

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 36: README.md (project readme per PRD § 12)

**Files:**
- Create/replace: `README.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
# sredio — SR&ED Financial Dashboard

A production-shaped Angular 21 dashboard for visualising timesheet and salary data and projecting SR&ED-eligible monetary credits for the remainder of the year.

**Live demo:** _<set after first GitHub Pages deploy — see § Deployment>_

## Tech stack

- Angular 21.2, zoneless change detection
- TypeScript strict, no `any`
- Tailwind CSS v4
- Flowbite (Tailwind component patterns + `flowbite` npm package)
- ApexCharts via `ng-apexcharts`
- Reactive forms
- Vitest
- GitHub Actions → GitHub Pages

## Project structure

```
src/app/
  core/           cross-cutting concerns (auth, layouts, nav, shared models)
  features/
    dashboard/   the SR&ED dashboard feature
    login/       mock auth login flow
    profile/     authenticated user profile page
  shared/        reusable cross-feature UI (currently README stubs)
src/environments/ dev / staging / prod env config (angular.json fileReplacements)
```

See `CLAUDE.md` for the binding architectural rules.

## Design decisions

- **Why ApexCharts over ngx-charts and Chart.js?** ngx-charts maintenance health is poor (729 open issues / 159 stale PRs). ApexCharts is actively maintained, SVG-based (suits PDF export to CRA), and visually polished. The minor tradeoff of imperative options-object configuration is acceptable; signal-driven re-renders work natively because `[series]` and `[xaxis]` bind to signal-derived computed values.
- **Why signals + computed over RxJS for derived state?** Synchronous derivation is what `computed()` is designed for. RxJS is reserved for async streams. The codebase has zero `BehaviorSubject` and zero `subscribe()` for data — `toSignal()` bridges any Observable into the signal world.
- **Why pure functions for calculations instead of a CalculationsService class?** Services imply DI and (often) state. The SR&ED calculations have neither. Pure functions in `features/dashboard/calculations/` are the simplest possible unit-test targets: feed inputs, assert outputs.
- **Why `CURRENT_DATE = '2025-09-30'`?** Q3-end gives ~9 months YTD and a non-trivial 3-month remainder for the linear projection to extrapolate over. Set in `core/constants/app-constants.ts`.
- **Linear projection formula and its limitation.** `projectFullYear(ytd) = (ytd / daysElapsed) × totalDays`. A production model would weight recent periods and account for seasonality; this is the simplest defensible model.
- **Why `salary / 2000` for hourly rate?** Matches the sred.io product convention ($60,000 / 2000 = $30/hr).
- **SR&ED simplification.** Every logged hour is treated as eligible for the projection. A production system would have per-project eligibility allocations.
- **Why Flowbite + Tailwind over Angular Material?** HR direction during the task brief. Flowbite (the official `flowbite` package + Tailwind classes) gives more design control than Material's opinionated theming and integrates natively with our Tailwind setup.
- **Why feature-based folder structure?** Aligns with Angular's style-guide recommendation for medium-to-large apps. Adding a new feature is a drop-in, not a refactor.
- **Why mock Auth + Observable + delay()?** Demonstrates the production HTTP shape without requiring a backend. Real swap is a one-line replacement per service. The `authGuard` and `authInterceptor` are real implementations.
- **Why CAD currency?** SR&ED is a Canadian tax credit program; client province is ON.

## Run locally

```bash
npm install
npm start
```

Visit `http://localhost:4200`. The app uses `HashLocationStrategy` so refresh works on any deployment.

Sign in with any email and a password of at least 4 characters (mock auth).

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

The live demo URL after first successful deploy will be:

```
https://kevinciang1006.github.io/sredio-test/
```

## License

Take-home submission, May 2026. Not for redistribution.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: project README with design decisions, run instructions, deployment

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 37: GitHub Actions deployment to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow file**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - name: Build
        run: npm run build -- --configuration=production --base-href=/sredio-test/
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/sredio/browser

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

If the Angular project's `outputPath` in `angular.json` differs from `dist/sredio/browser`, update the workflow's `path:` to match. Check `angular.json` → `projects.sredio.architect.build.options.outputPath`.

- [ ] **Step 2: Enable GitHub Pages in repo settings (manual user step)**

Reminder for the user: in `https://github.com/kevinciang1006/sredio-test/settings/pages`, under **Source**, select **GitHub Actions**.

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Actions workflow deploys main to GitHub Pages

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push
```

- [ ] **Step 4: Verify deployment**

After push, visit `https://github.com/kevinciang1006/sredio-test/actions` and confirm the workflow runs green. Then visit `https://kevinciang1006.github.io/sredio-test/` and verify the app loads.

If the first deploy fails because of `outputPath` mismatch, fix `path:` in the workflow and push again.

---

### Task 38: Final smoke test + review prep

**Files:**
- None (verification only).

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```
Expected: all calculation tests pass (15+ tests).

- [ ] **Step 2: Production build locally**

```bash
npm run build -- --configuration=production
```
Expected: succeeds, bundle warnings only (not errors).

- [ ] **Step 3: Manual end-to-end smoke test**

Run `npm start` and walk through:

1. Visit `/` → redirected to `/login`.
2. Try submitting empty form → both fields show validation errors.
3. Try password "abc" (3 chars) → password validation error.
4. Submit `demo@sredio.com` + `demo` → redirected to `/dashboard`.
5. Verify all 4 summary cards show numeric values, not zeros.
6. Verify YTD < Projected Full Year (because we're at 2025-09-30, not end of year).
7. Verify the project breakdown chart shows 5 columns (projects), each stacked with 7 colours (employees).
8. Verify the aggregate chart shows 5 horizontal bars; grand total below.
9. Click "Cost" toggle. Both charts re-render. Y-axis on the breakdown chart switches from numbers to CAD; the aggregate chart's grand total switches from "N hrs" to "$N".
10. Sort employee grid by each column. Sort indicator appears/flips correctly.
11. Click "Profile" in nav bar. Profile card renders with mock employee.
12. Click "Logout". Redirected to `/login`. Refresh the page — still on `/login`, not auto-logged-in.
13. Sign in again. Refresh — stays on `/dashboard` (localStorage rehydration works).

- [ ] **Step 4: Defensibility cheat-sheet review**

Re-read `docs/superpowers/specs/2026-05-15-sred-dashboard-design.md` § 16 (Defensibility cheat-sheet). For each Q&A there, mentally confirm you can answer it without notes. If any answer feels weak, add a sentence to your own prep notes.

- [ ] **Step 5: Commit any final polish**

If you spotted UI issues during the smoke test (margins, alignment, typography), fix and commit:

```bash
git add -A
git commit -m "style: final UI polish from smoke test

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push
```

- [ ] **Step 6: Update the README live demo URL**

Once the GitHub Pages deploy is live, edit `README.md` and replace the live demo placeholder with the actual URL. Commit and push.

```bash
git add README.md
git commit -m "docs: set live demo URL in README

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push
```

---

## Self-review checklist (executed against the spec)

- ✅ Section 2 hard requirements (Angular 21, OnPush, inject, input/output, @if/@for, signals, no any) — enforced across every component in Tasks 21–34.
- ✅ Section 3 decisions table (every PRD override) — implemented: Flowbite (Tasks 2), ApexCharts (Task 3), CAD (Tasks 27, 30, 31, 33), hand-rolled sort (Task 31), global toggle (Task 28 + 32), Vitest (Task 4), zoneless (Tasks 1 + 20), no `.component.` suffix (Task 6 + all components), separate files (every component), feature-based grouping (Task 6), pure-function calculations (Tasks 10–14), per-resource services (Task 15), per-resource mock files (Task 9), Observable+delay (Tasks 15–17), multi-env (Task 5), three features (Tasks 25, 32, 34), nested routes + layouts (Task 24), Auth implementation (Tasks 17–19, 22–23, 25), README stubs (Task 6).
- ✅ Section 5 folder structure — built in Task 6.
- ✅ Section 6 data flow (`toSignal` bridges, computed derivations, no `subscribe()` for data) — enforced in Task 32 (Dashboard) and Task 34 (Profile).
- ✅ Section 8 calculations (5 modules + edge cases) — Tasks 10–14 TDD.
- ✅ Section 9 type conventions (literal unions, readonly, no ngClass) — applied across components.
- ✅ Section 12 testing strategy (calculation tests must-have) — Tasks 10–14 each include unit tests.
- ✅ Section 13 docs (CLAUDE.md, README, folder stubs) — Tasks 35, 36, 6.
- ✅ Section 14 deployment — Task 37.

## Type / signature consistency check

- `Employee` interface (Task 7) used in `hourlyRate` (Task 10), `employeeCostOnProject` (Task 12), `grandTotalCost` (Task 13), `AuthService` (Task 17), `Profile` extends `Employee` (Task 7), `NavBarComponent.currentUser` (Task 21), `ProfileCardComponent.hourly` (Task 33), `DashboardComponent.employees` (Task 32). Field names consistent across all uses: `id`, `name`, `email`, `hireDate`, `annualSalary`, `role`.
- `ChartMode = 'hours' | 'cost'` (Task 7) used identically in `HoursCostToggleComponent` (Task 28), `ProjectBreakdownChartComponent` (Task 29), `AggregateChartComponent` (Task 30), `DashboardComponent` (Task 32).
- `Projection` interface (Task 14) consumed by `DashboardComponent.projectedFullYearHours` / `projectedFullYearCost` (Task 32) — both use `.projectedFullYear` property.
- `EmployeeRow` (Task 7) produced by `DashboardComponent.employeeRows` (Task 32) and consumed by `EmployeeGridComponent` (Task 31). All keys match.
- `Credentials` (Task 7) consumed by `LoginComponent.form.getRawValue()` (Task 25) and `AuthService.login` (Task 17). Both expect `{ email, password }`.
- `APP_CONSTANTS.LOCAL_STORAGE_KEYS` (Task 8) used in `AuthService` (Task 17). Keys match: `AUTH_TOKEN`, `AUTH_USER`.

No drift detected.
