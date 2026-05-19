# Sub-project G: UX Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh app chrome (sidebar/top-bar redesign), add Employees page, and polish the dashboard (claim period dropdown, mode-tabs placement, multi-year mock data, tooltip multiline, projects bar truncate, Recalculate wire-up).

**Architecture:** Standalone Angular 21 components, signals throughout, OnPush change detection. Sidebar gets the logo + new menu items (Dashboard, Employees, Reports/Audits/Settings SOON). A top-bar replaces the nav-bar and lives over the main content with tenant + search + bell + avatar. A new shared `ToastService` provides feedback for "coming soon" clicks and the Recalculate action. The Client model gains a `claimPeriods` list; the dashboard adds an `activeClaimPeriodId` signal that cascades through all existing computeds. The employee-modal is promoted to `shared/` so the new Employees page can reuse it.

**Tech Stack:** Angular 21 (standalone, zoneless, signals, OnPush, `inject()`, `input()`, `output()`, `@if`/`@for`/`@switch`), TypeScript strict, Tailwind v4 + Flowbite, Vitest.

**Spec reference:** `docs/superpowers/specs/2026-05-19-sred-subproject-g-design.md`

---

## File Structure

**New files:**
- `src/app/shared/services/toast.service.ts` — global toast state
- `src/app/shared/components/toast/toast.ts` + `.html` — renders active toasts
- `src/app/core/components/top-bar/top-bar.ts` + `.html` — replaces nav-bar
- `src/app/core/components/page-header/page-header.ts` + `.html` — reusable page title row
- `src/app/features/employees/employees-page.ts` + `.html` — Employees route container
- `src/app/features/employees/components/employees-table.ts` + `.html` — sortable table
- `src/app/features/employees/calculations/filter-employees.ts` — pure filter + sort
- `src/app/features/employees/calculations/filter-employees.spec.ts` — TDD spec
- `src/app/features/employees/models/employee-row.ts` — extended row type
- `src/app/shared/components/employee-modal/employee-modal.ts` + `.html` — moved from features/dashboard

**Modified files:**
- `src/app/core/components/side-bar/side-bar.ts` + `.html` — logo, new items, SOON badges, Help footer
- `src/app/core/components/authenticated-layout/authenticated-layout.ts` + `.html` — flex reflow
- `src/app/core/models/client.model.ts` — `claimPeriods: ClaimPeriod[]`
- `src/app/features/dashboard/mock/clients.mock.ts` — multi-period mock clients
- `src/app/features/dashboard/mock/time-entries.mock.ts` — span 2024-01-01 → 2026-05-19
- `src/app/features/dashboard/dashboard.ts` + `.html` — page header row, activeClaimPeriodId, recalculate
- `src/app/features/dashboard/components/client-header/client-header.ts` + `.html` — period dropdown
- `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html` — truncate fix
- `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html` — truncate fix
- `src/app/shared/directives/tooltip.directive.ts` — multiline support
- `src/app/app.routes.ts` — `/tenant/:tenantId/employees` route

**Deleted files:**
- `src/app/core/components/nav-bar/` — replaced by top-bar
- `src/app/features/dashboard/components/employee-modal/` — moved to shared

---

## Task 1: Fix tooltip multiline + projects bar truncate (warm-up)

**Files:**
- Modify: `src/app/shared/directives/tooltip.directive.ts`
- Modify: `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html`
- Modify: `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html`

- [ ] **Step 1: Remove `whitespace-nowrap` from tooltip classes**

In `src/app/shared/directives/tooltip.directive.ts`, find the `classes` array in `show()` and remove `'whitespace-nowrap'`. The new array:

```ts
    const classes = [
      'pointer-events-none', 'fixed', 'z-[60]',
      'bg-gray-900', 'text-white', 'text-xs',
      'px-2', 'py-1', 'rounded', 'shadow-lg',
      'max-w-xs',
    ];
```

Long tooltip text will now wrap; short text stays single-line.

- [ ] **Step 2: Fix projects bar truncate**

In `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html`, change both inner `<span>` lines to add `block w-full max-w-full`:

```html
          <span class="block w-full max-w-full truncate px-1 text-center leading-tight">{{ bar.projectName }}</span>
          <span class="block w-full max-w-full truncate px-1 text-center leading-tight opacity-90">
            @if (mode() === 'hours') {
              {{ bar.value | number:'1.0-0' }} hrs
            } @else {
              {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
            }
          </span>
```

- [ ] **Step 3: Same fix in employee-breakdown-bar**

In `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html`, change both inner `<span>` lines the same way:

```html
        <span class="block w-full max-w-full truncate px-1 text-center leading-tight">{{ bar.name }}</span>
        <span class="block w-full max-w-full truncate px-1 text-center leading-tight opacity-90">
          @if (mode() === 'hours') {
            {{ bar.value | number:'1.0-0' }} hrs
          } @else {
            {{ bar.value | currency:'CAD':'symbol-narrow':'1.0-0' }}
          }
        </span>
```

- [ ] **Step 4: Build and verify**

Run: `npx ng build --configuration development`
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/directives/tooltip.directive.ts \
  src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html \
  src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html
git commit -m "$(cat <<'EOF'
fix: tooltip multiline + projects/employee bar segment truncate

Drop whitespace-nowrap on tooltip so long text wraps to multiple lines.
Add block w-full max-w-full to bar segment spans so truncate has a width to clip against.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Toast service + toast component

**Files:**
- Create: `src/app/shared/services/toast.service.ts`
- Create: `src/app/shared/components/toast/toast.ts`
- Create: `src/app/shared/components/toast/toast.html`

- [ ] **Step 1: Create the toast service**

Create `src/app/shared/services/toast.service.ts`:

```ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  readonly id: number;
  readonly text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<readonly ToastMessage[]>([]);

  show(text: string, durationMs = 2500): void {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, text }]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, durationMs);
  }
}
```

- [ ] **Step 2: Create the toast component template**

Create `src/app/shared/components/toast/toast.html`:

```html
<div
  class="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 items-end"
  role="status"
  aria-live="polite">
  @for (t of toasts(); track t.id) {
    <div class="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs animate-in fade-in slide-in-from-bottom-2">
      {{ t.text }}
    </div>
  }
</div>
```

- [ ] **Step 3: Create the toast component class**

Create `src/app/shared/components/toast/toast.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toastSvc = inject(ToastService);
  readonly toasts = this.toastSvc.toasts;
}
```

- [ ] **Step 4: Build**

Run: `npx ng build --configuration development`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/services/toast.service.ts src/app/shared/components/toast
git commit -m "$(cat <<'EOF'
feat: add ToastService and app-toast component

Minimal global toast for "coming soon" feedback and the Recalculate action.
Signal-based, fixed bottom-right, auto-dismisses after 2.5s.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Multi-period Client model + clients mock

**Files:**
- Modify: `src/app/core/models/client.model.ts`
- Modify: `src/app/features/dashboard/mock/clients.mock.ts`

- [ ] **Step 1: Update the Client model**

Replace `src/app/core/models/client.model.ts` with:

```ts
export interface ClaimPeriod {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface Client {
  readonly id: string;
  readonly name: string;
  readonly claimPeriods: readonly ClaimPeriod[];
  readonly province: string;
  readonly timeZone: string;
  readonly sredCreditRate?: number;
}
```

The old single `claimPeriod` is removed. Every consumer must read from `claimPeriods` and pick the active one.

- [ ] **Step 2: Update the clients mock**

Replace `src/app/features/dashboard/mock/clients.mock.ts` with:

```ts
import { Client, ClaimPeriod } from '../../../core/models/client.model';
import { TENANTS } from '../../../core/constants/tenants.const';

const SHARED_CLAIM_PERIODS: readonly ClaimPeriod[] = [
  { id: '2024', startDate: '2024-01-01', endDate: '2024-12-31' },
  { id: '2025', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: '2026', startDate: '2026-01-01', endDate: '2026-12-31' },
];

export const MOCK_CLIENTS: Record<string, Client> = {
  [TENANTS[0].id]: {
    id: 'client-001',
    name: 'Northwind Labs',
    claimPeriods: SHARED_CLAIM_PERIODS,
    province: 'ON',
    timeZone: 'EST',
    sredCreditRate: 0.45,
  },
  [TENANTS[1].id]: {
    id: 'client-002',
    name: 'Maple Robotics',
    claimPeriods: SHARED_CLAIM_PERIODS,
    province: 'BC',
    timeZone: 'PST',
    sredCreditRate: 0.40,
  },
  [TENANTS[2].id]: {
    id: 'client-003',
    name: 'Quantum Dynamics',
    claimPeriods: SHARED_CLAIM_PERIODS,
    province: 'AB',
    timeZone: 'MST',
    sredCreditRate: 0.35,
  },
  [TENANTS[3].id]: {
    id: 'client-004',
    name: 'Cedar AI Labs',
    claimPeriods: SHARED_CLAIM_PERIODS,
    province: 'QC',
    timeZone: 'EST',
    sredCreditRate: 0.30,
  },
};

export const MOCK_CLIENT: Client = MOCK_CLIENTS[TENANTS[0].id];
```

- [ ] **Step 3: Build to see all the type errors**

Run: `npx ng build --configuration development`
Expected: build **FAILS** with errors at every callsite that reads `client().claimPeriod` (no `s`). This is expected — Task 5 fixes them. For now, note the list of failing files.

- [ ] **Step 4: Commit (model change only — not yet wired)**

```bash
git add src/app/core/models/client.model.ts src/app/features/dashboard/mock/clients.mock.ts
git commit -m "$(cat <<'EOF'
refactor: Client.claimPeriod -> claimPeriods[]

Add ClaimPeriod interface with id, replace single claimPeriod with a list ordered by start date. Each tenant gets 2024/2025/2026 periods.

Note: dashboard consumers still reference the old single-period field; the next commit wires them up to the new active-period signal. Build is intentionally broken between commits.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

> If you prefer a green build between commits, combine this commit with Task 5's commit instead.

---

## Task 4: Multi-year time entries mock

**Files:**
- Modify: `src/app/features/dashboard/mock/time-entries.mock.ts`

- [ ] **Step 1: Extend the date range in the generator**

In `src/app/features/dashboard/mock/time-entries.mock.ts`, change the `start` and `end` constants and the date stop condition:

```ts
  const start = new Date('2024-01-01').getTime();
  const end   = new Date('2026-05-19').getTime();
  const ms = 1000 * 60 * 60 * 24;
```

Everything else in the generator stays the same — the seeded RNG produces deterministic data for the larger range.

- [ ] **Step 2: Build**

Run: `npx ng build --configuration development`
Expected: same build errors as Task 3 (still referring to `claimPeriod` not `claimPeriods`). No new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/dashboard/mock/time-entries.mock.ts
git commit -m "$(cat <<'EOF'
feat: extend mock time entries through 2026-05-19

Generator now produces entries spanning 2024-01-01 through 2026-05-19 (today). Seeded RNG keeps data deterministic.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Dashboard wiring for activeClaimPeriodId

**Files:**
- Modify: `src/app/features/dashboard/dashboard.ts`

- [ ] **Step 1: Add the activeClaimPeriodId signal and helper computeds**

In `src/app/features/dashboard/dashboard.ts`, add a new signal and a computed for the active period. Place these immediately after the existing `selectedPeriod` signal declaration around line 103:

```ts
  readonly activeClaimPeriodId = signal<string | null>(null);

  readonly activeClaimPeriod = computed(() => {
    const c = this.client();
    if (!c) return null;
    const id = this.activeClaimPeriodId();
    const found = id ? c.claimPeriods.find(p => p.id === id) : null;
    if (found) return found;
    // Default: period containing today (asOf)
    return c.claimPeriods.find(p => p.startDate <= this.asOf && p.endDate >= this.asOf)
      ?? c.claimPeriods[c.claimPeriods.length - 1]
      ?? null;
  });
```

- [ ] **Step 2: Add an `onClaimPeriodChange` handler**

Add this method near the other event handlers at the bottom of the class:

```ts
  onClaimPeriodChange(periodId: string): void {
    this.activeClaimPeriodId.set(periodId);
    this.selectedPeriod.set('ytd');
    this.drilledProjectId.set(null);
  }
```

Switching the claim period resets the dashboard's selected quarter back to YTD and exits any drilled view — both would otherwise reference data from the previous period.

- [ ] **Step 3: Replace every `c.claimPeriod.*` reference with the active period**

The dashboard reads `c.claimPeriod.startDate` / `c.claimPeriod.endDate` in five places. Update each:

**In `periodEntries`:**

```ts
  readonly periodEntries = computed(() => {
    const p = this.activeClaimPeriod();
    if (!p) return [];
    const { start, end } = quarterBoundaries(this.selectedPeriod(), p.startDate, this.asOf);
    return filterEntriesByPeriod(this.timeEntries(), start, end);
  });
```

**In `quarterlyTabs`:**

```ts
  readonly quarterlyTabs = computed<readonly QuarterTab[]>(() => {
    const c = this.client();
    const p = this.activeClaimPeriod();
    if (!c || !p) return [];
    const entries = this.timeEntries();
    const employees = this.employees();
    const projects = this.projects();
    const mode = this.mode();
    const creditRate = c.sredCreditRate ?? 0.45;
    const year = parseInt(p.startDate.slice(0, 4), 10);

    const PERIODS: QuarterPeriod[] = ['q1', 'q2', 'q3', 'q4', 'ytd'];
    const SUBLABELS: Record<QuarterPeriod, string> = {
      q1: `Jan 1 – Mar 31, ${year}`,
      q2: `Apr 1 – Jun 30, ${year}`,
      q3: `Jul 1 – Sep 30, ${year}`,
      q4: `Oct 1 – Dec 31, ${year}`,
      ytd: `${p.startDate} – ${this.asOf}`,
    };

    return PERIODS.map(period => {
      const { start, end } = quarterBoundaries(period, p.startDate, this.asOf);
      const pEntries = filterEntriesByPeriod(entries, start, end);
      let value: number;
      if (mode === 'hours') {
        value = sredTotalHours(pEntries, projects);
      } else {
        const cost = sredTotalCost(pEntries, employees, projects);
        value = mode === 'credits' ? sredCredits(cost, creditRate) : cost;
      }
      return { period, label: QUARTER_LABELS[period], sublabel: SUBLABELS[period], value };
    });
  });
```

**In `projectedFullYearValue`:**

```ts
  readonly projectedFullYearValue = computed<number | null>(() => {
    const p = this.activeClaimPeriod();
    if (!p) return null;
    return projectFullYear(
      this.ytdValue(),
      p.startDate,
      p.endDate,
      this.asOf,
    ).projectedFullYear;
  });
```

**In `employeeRows`:**

```ts
  readonly employeeRows = computed<readonly EmployeeRow[]>(() => {
    const p = this.activeClaimPeriod();
    if (!p) return [];
    const { start, end } = quarterBoundaries('ytd', p.startDate, this.asOf);
    const ytdEntries = filterEntriesByPeriod(this.timeEntries(), start, end);
    return this.employees().map(emp => {
      const ytdHours = ytdEntries
        .filter(e => e.employeeId === emp.id)
        .reduce((sum, e) => sum + e.hours, 0);
      const rate = hourlyRate(emp);
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        hireDate: emp.hireDate,
        endDate: emp.endDate,
        annualSalary: emp.annualSalary,
        confirmedSalary: emp.confirmedSalary,
        isSpecialEmployee: emp.isSpecialEmployee ?? false,
        hourlyRate: rate,
        ytdHours,
        ytdCost: ytdHours * rate,
      };
    });
  });
```

**In `modalPeriodLabel`:**

```ts
  readonly modalPeriodLabel = computed(() => {
    const p = this.activeClaimPeriod();
    if (!p) return '';
    const { start, end } = quarterBoundaries(this.selectedPeriod(), p.startDate, this.asOf);
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  });
```

- [ ] **Step 4: Build to verify no more `claimPeriod` references**

Run: `npx ng build --configuration development`
Expected: build succeeds. If you see "Property 'claimPeriod' does not exist", grep for remaining sites: `grep -rn "claimPeriod[^s]" src/app`.

- [ ] **Step 5: Run tests**

Run: `npx vitest run`
Expected: 52+ tests pass (all existing tests).

- [ ] **Step 6: Commit**

```bash
git add src/app/features/dashboard/dashboard.ts
git commit -m "$(cat <<'EOF'
feat: dashboard reads from activeClaimPeriod signal

Add activeClaimPeriodId + activeClaimPeriod computed (defaults to the period containing today). Every downstream computed (periodEntries, quarterlyTabs, projectedFullYearValue, employeeRows, modalPeriodLabel) now reads from activeClaimPeriod. Switching the period resets selected quarter to YTD and exits any drilled project.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Client header with period dropdown

**Files:**
- Modify: `src/app/features/dashboard/components/client-header/client-header.ts`
- Modify: `src/app/features/dashboard/components/client-header/client-header.html`
- Modify: `src/app/features/dashboard/dashboard.html` (pass new inputs/outputs)

- [ ] **Step 1: Update the client-header component class**

Replace `src/app/features/dashboard/components/client-header/client-header.ts` (preserve any existing imports beyond the obvious):

```ts
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Client, ClaimPeriod } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderComponent {
  readonly client = input<Client | null>(null);
  readonly isLoading = input(false);
  readonly activePeriod = input<ClaimPeriod | null>(null);
  readonly periodChange = output<string>();

  readonly isOpen = signal(false);

  toggle(): void { this.isOpen.update(v => !v); }
  select(periodId: string): void {
    this.periodChange.emit(periodId);
    this.isOpen.set(false);
  }

  formatRange(p: ClaimPeriod): string {
    return `${p.startDate} → ${p.endDate}`;
  }
}
```

- [ ] **Step 2: Update the template with the dropdown**

Replace `src/app/features/dashboard/components/client-header/client-header.html`:

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
      <div class="text-sm text-gray-600 flex items-center gap-2">
        <span>Claim period</span>
        <div class="relative">
          <button
            type="button"
            (click)="toggle()"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700">
            @if (activePeriod(); as p) {
              {{ formatRange(p) }}
            } @else {
              Select period
            }
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (isOpen()) {
            <div class="absolute right-0 mt-1 w-64 rounded-lg shadow-lg bg-white border border-gray-200 z-30 py-1">
              @for (p of c.claimPeriods; track p.id) {
                <button
                  type="button"
                  (click)="select(p.id)"
                  class="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <span>{{ formatRange(p) }}</span>
                  @if (activePeriod()?.id === p.id) {
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                </button>
              }
            </div>
          }
        </div>
        <span>· Province <span class="font-medium">{{ c.province }}</span></span>
      </div>
    </div>
  }
</section>
```

- [ ] **Step 3: Wire the new inputs/outputs in dashboard.html**

In `src/app/features/dashboard/dashboard.html`, update the `<app-client-header>` usage near the top:

```html
  <app-client-header
    [client]="client()"
    [isLoading]="isLoading()"
    [activePeriod]="activeClaimPeriod()"
    (periodChange)="onClaimPeriodChange($event)" />
```

- [ ] **Step 4: Build + tests**

Run: `npx ng build --configuration development && npx vitest run`
Expected: build succeeds, tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dashboard/components/client-header src/app/features/dashboard/dashboard.html
git commit -m "$(cat <<'EOF'
feat: claim period dropdown in client-header

Replace static claim period label with a dropdown listing all client claim periods. Selecting a period emits periodChange; dashboard updates activeClaimPeriodId and resets the selected quarter to YTD.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Sidebar redesign

**Files:**
- Modify: `src/app/core/components/side-bar/side-bar.ts`
- Modify: `src/app/core/components/side-bar/side-bar.html`

- [ ] **Step 1: Update the sidebar template with logo, new items, SOON badges, Help footer**

Replace `src/app/core/components/side-bar/side-bar.html`:

```html
<aside
  [class]="'fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-[width] duration-300 ease-in-out flex flex-col ' + (collapsed() ? 'w-16' : 'w-56')"
  aria-label="Sidenav">

  <div [class]="'h-14 flex items-center px-3 border-b border-gray-100 ' + (collapsed() ? 'justify-center' : 'gap-2')">
    <span class="inline-flex w-8 h-8 rounded bg-blue-600 text-white items-center justify-center text-sm font-bold shrink-0">S</span>
    @if (!collapsed()) {
      <span class="text-lg font-semibold text-blue-600">sred.io</span>
    }
  </div>

  <nav class="flex-1 py-3 px-2 overflow-y-auto">
    <ul class="space-y-1 list-none m-0 p-0">
      <li class="relative group">
        <a
          [routerLink]="['/tenant', tenantId(), 'dashboard']"
          routerLinkActive
          #dashRla="routerLinkActive"
          [class]="'flex items-center px-2 py-2 rounded-lg transition-colors hover:bg-gray-50 ' + (dashRla.isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700')">
          <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
          </svg>
          @if (!collapsed()) {
            <span class="ml-3 text-sm">Dashboard</span>
          }
        </a>
        @if (collapsed()) {
          <div class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">Dashboard</div>
        }
      </li>

      <li class="relative group">
        <a
          [routerLink]="['/tenant', tenantId(), 'employees']"
          routerLinkActive
          #empRla="routerLinkActive"
          [class]="'flex items-center px-2 py-2 rounded-lg transition-colors hover:bg-gray-50 ' + (empRla.isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700')">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          @if (!collapsed()) {
            <span class="ml-3 text-sm">Employees</span>
          }
        </a>
        @if (collapsed()) {
          <div class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">Employees</div>
        }
      </li>

      @for (item of soonItems; track item.label) {
        <li class="relative group">
          <div
            [appTooltip]="'Coming soon'"
            aria-disabled="true"
            class="flex items-center px-2 py-2 rounded-lg cursor-not-allowed text-gray-400">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="item.iconPath"></svg>
            @if (!collapsed()) {
              <span class="ml-3 text-sm flex-1">{{ item.label }}</span>
              <span class="text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
            }
          </div>
        </li>
      }
    </ul>
  </nav>

  <div class="border-t border-gray-100 p-2">
    <a
      href="mailto:success@sred.io"
      [class]="'flex items-center px-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ' + (collapsed() ? 'justify-center' : '')">
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M12 14h.01" />
      </svg>
      @if (!collapsed()) {
        <span class="ml-3 text-sm">Help</span>
      }
    </a>
  </div>

  <div class="border-t border-gray-100">
    <button
      type="button"
      (click)="collapseToggle.emit()"
      [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
      class="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
      <svg class="w-4 h-4 transition-transform" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>
</aside>
```

> Note: the `[innerHTML]` for the SOON item icons is rendered from a constant string in the component. Angular sanitizes SVG `innerHTML` — this is fine for static, controlled icons.

- [ ] **Step 2: Update the sidebar component class**

Replace `src/app/core/components/side-bar/side-bar.ts`:

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';

interface SoonItem {
  readonly label: string;
  readonly iconPath: SafeHtml;
}

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './side-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly collapsed = input(false);
  readonly tenantId = input.required<string>();
  readonly collapseToggle = output<void>();

  readonly soonItems: readonly SoonItem[] = [
    {
      label: 'Reports',
      iconPath: this.sanitizer.bypassSecurityTrustHtml(
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h2m-6 6v-6m0 6H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2" />'
      ),
    },
    {
      label: 'Audits',
      iconPath: this.sanitizer.bypassSecurityTrustHtml(
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />'
      ),
    },
    {
      label: 'Settings',
      iconPath: this.sanitizer.bypassSecurityTrustHtml(
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />'
      ),
    },
  ];
}
```

- [ ] **Step 3: Build**

Run: `npx ng build --configuration development`
Expected: build succeeds. The sidebar still gets `tenantId` from authenticated-layout; the collapse toggle now emits up (we'll wire it in Task 9).

- [ ] **Step 4: Commit**

```bash
git add src/app/core/components/side-bar
git commit -m "$(cat <<'EOF'
feat: redesign sidebar with logo, new menu items, Help footer

Logo + sred.io wordmark at top. Items: Dashboard, Employees, Reports/Audits/Settings (SOON badge + Coming soon tooltip). Help mailto footer. Collapse toggle moved into sidebar itself.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Top-bar component

**Files:**
- Create: `src/app/core/components/top-bar/top-bar.ts`
- Create: `src/app/core/components/top-bar/top-bar.html`

- [ ] **Step 1: Create the top-bar template**

Create `src/app/core/components/top-bar/top-bar.html`:

```html
<header class="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
  <div class="relative shrink-0">
    <button
      type="button"
      (click)="toggleTenantDropdown()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      {{ currentTenant()?.name ?? 'Select tenant' }}
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    @if (isTenantOpen()) {
      <div class="absolute left-0 mt-2 w-52 rounded-lg shadow-lg bg-white border border-gray-200 z-50 py-1">
        @for (t of tenants; track t.id) {
          <button
            type="button"
            (click)="switchTenant(t.id)"
            class="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <span>{{ t.name }}</span>
            @if (t.id === currentTenantId()) {
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          </button>
        }
      </div>
    }
  </div>

  <div class="flex-1"></div>

  <button
    type="button"
    [appTooltip]="'Search (coming soon)'"
    (click)="onComingSoon('Search')"
    class="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    aria-label="Search">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  </button>

  <button
    type="button"
    [appTooltip]="'Notifications (coming soon)'"
    (click)="onComingSoon('Notifications')"
    class="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    aria-label="Notifications">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
  </button>

  <div class="relative shrink-0">
    <button
      type="button"
      (click)="toggleDropdown()"
      class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100">
      @if (currentUser(); as u) {
        <app-avatar [name]="u.name" size="sm" />
        <div class="min-w-0 text-left hidden sm:block">
          <p class="text-sm font-medium text-gray-900 truncate max-w-40">{{ u.name }}</p>
          <p class="text-xs text-gray-500 truncate max-w-40">{{ u.email }}</p>
        </div>
        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      }
    </button>

    @if (isOpen()) {
      <div class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
        <a
          [routerLink]="['/tenant', currentTenantId(), 'profile']"
          (click)="isOpen.set(false)"
          class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </a>
        <hr class="border-gray-100" />
        <button
          type="button"
          (click)="logout()"
          class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    }
  </div>
</header>
```

- [ ] **Step 2: Create the top-bar component class**

Read the existing nav-bar component first to copy the logic verbatim:

```bash
cat src/app/core/components/nav-bar/nav-bar.ts
```

Then create `src/app/core/components/top-bar/top-bar.ts` mirroring nav-bar's logic. Inject `AuthService`, `Router`, `ToastService`. Expose `currentUser`, `currentTenant`, `currentTenantId`, `tenants`, `isOpen`, `isTenantOpen` signals. Methods: `toggleDropdown`, `toggleTenantDropdown`, `switchTenant`, `logout`, plus a new `onComingSoon(feature: string)` that calls `toastSvc.show(\`${feature} coming soon\`)`.

Skeleton:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { ToastService } from '../../../shared/services/toast.service';
import { TENANTS } from '../../constants/tenants.const';
import { LAST_TENANT_ID } from '../../constants/storage.const';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink, AvatarComponent, TooltipDirective],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastSvc = inject(ToastService);

  readonly currentUser = this.auth.currentUser;
  readonly tenants = TENANTS;
  readonly isOpen = signal(false);
  readonly isTenantOpen = signal(false);

  readonly currentTenantId = computed(() => {
    const url = this.router.url;
    const m = url.match(/\/tenant\/([^/]+)/);
    return m ? m[1] : '';
  });

  readonly currentTenant = computed(() => {
    const id = this.currentTenantId();
    return this.tenants.find(t => t.id === id);
  });

  toggleDropdown(): void { this.isOpen.update(v => !v); }
  toggleTenantDropdown(): void { this.isTenantOpen.update(v => !v); }

  switchTenant(id: string): void {
    this.isTenantOpen.set(false);
    localStorage.setItem(LAST_TENANT_ID, id);
    this.router.navigate(['/tenant', id, 'dashboard']);
  }

  logout(): void {
    this.isOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onComingSoon(feature: string): void {
    this.toastSvc.show(`${feature} coming soon`);
  }
}
```

> Important: the imports from `core/constants/storage.const` and `core/services/auth.service` must match the existing nav-bar — copy verbatim if your skeleton above doesn't match.

- [ ] **Step 3: Build**

Run: `npx ng build --configuration development`
Expected: build succeeds. The component isn't wired into the layout yet — that's Task 9.

- [ ] **Step 4: Commit**

```bash
git add src/app/core/components/top-bar
git commit -m "$(cat <<'EOF'
feat: add top-bar component (replaces nav-bar)

Tenant selector on left; search and notification icons (with 'coming soon' toast on click) and avatar dropdown on right. Renders over main content only; logo moved into the sidebar.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Authenticated-layout reflow + remove nav-bar

**Files:**
- Modify: `src/app/core/components/authenticated-layout/authenticated-layout.ts`
- Modify: `src/app/core/components/authenticated-layout/authenticated-layout.html`
- Delete: `src/app/core/components/nav-bar/`

- [ ] **Step 1: Update the layout template**

Replace `src/app/core/components/authenticated-layout/authenticated-layout.html`:

```html
<div class="antialiased bg-gray-50 min-h-screen">
  <app-side-bar
    [collapsed]="sidebarCollapsed()"
    [tenantId]="tenantId()"
    (collapseToggle)="toggleSidebar()" />

  <div [class]="'transition-[margin] duration-300 ease-in-out ' + (sidebarCollapsed() ? 'ml-16' : 'ml-56')">
    <app-top-bar />
    <main class="min-h-[calc(100vh-3.5rem)]">
      <div class="p-6 max-w-7xl mx-auto">
        <router-outlet />
      </div>
    </main>
  </div>

  <app-toast />
</div>
```

- [ ] **Step 2: Update the layout component class**

Replace `src/app/core/components/authenticated-layout/authenticated-layout.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs/operators';
import { TopBarComponent } from '../top-bar/top-bar';
import { SideBarComponent } from '../side-bar/side-bar';
import { ToastComponent } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, TopBarComponent, SideBarComponent, ToastComponent],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent {
  private readonly route = inject(ActivatedRoute);

  readonly sidebarCollapsed = signal(false);
  readonly tenantId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('tenantId') ?? '')),
    { initialValue: this.route.snapshot.params['tenantId'] as string ?? '' },
  );

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
```

- [ ] **Step 3: Delete the old nav-bar**

```bash
rm -r src/app/core/components/nav-bar
```

- [ ] **Step 4: Build + tests**

Run: `npx ng build --configuration development && npx vitest run`
Expected: build succeeds, tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/components/authenticated-layout src/app/core/components/nav-bar
git commit -m "$(cat <<'EOF'
refactor: authenticated layout uses sidebar + top-bar; remove nav-bar

Sidebar fixed-left with logo at top. Top-bar lives over main content. Toast outlet mounted once at the layout level. nav-bar deleted (replaced by top-bar).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Page header component (shared)

**Files:**
- Create: `src/app/core/components/page-header/page-header.ts`
- Create: `src/app/core/components/page-header/page-header.html`

- [ ] **Step 1: Create the page header template**

Create `src/app/core/components/page-header/page-header.html`:

```html
<div class="flex items-start justify-between flex-wrap gap-3">
  <div>
    <h1 class="text-xl font-bold text-gray-900">{{ title() }}</h1>
    @if (subtitle()) {
      <p class="text-sm text-gray-500 mt-0.5">{{ subtitle() }}</p>
    }
  </div>
  <div class="flex items-center gap-3 flex-wrap">
    <ng-content />
  </div>
</div>
```

- [ ] **Step 2: Create the page header class**

Create `src/app/core/components/page-header/page-header.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
```

- [ ] **Step 3: Build**

Run: `npx ng build --configuration development`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/core/components/page-header
git commit -m "$(cat <<'EOF'
feat: add app-page-header (title + subtitle + ng-content slot for controls)

Reusable page header row used by dashboard and the new Employees page.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Dashboard page header row + dissolve first card + Recalculate

**Files:**
- Modify: `src/app/features/dashboard/dashboard.ts`
- Modify: `src/app/features/dashboard/dashboard.html`

- [ ] **Step 1: Add isRecalculating signal and handler in dashboard.ts**

In `src/app/features/dashboard/dashboard.ts`:

1. Add `import { ToastService } from '../../shared/services/toast.service';` near other imports.
2. Add `import { PageHeaderComponent } from '../../core/components/page-header/page-header';` near other imports.
3. Add `PageHeaderComponent` to the component's `imports: [...]` array.
4. Inject the toast service at the top of the class: `private readonly toastSvc = inject(ToastService);`
5. Add the signal near the other signals (after `modalMode`): `readonly isRecalculating = signal(false);`
6. Add the handler near the other event handlers at the bottom:

```ts
  onRecalculate(): void {
    if (this.isRecalculating()) return;
    this.isRecalculating.set(true);
    setTimeout(() => {
      this.isRecalculating.set(false);
      this.toastSvc.show('Projections recalculated');
    }, 800);
  }
```

- [ ] **Step 2: Restructure dashboard.html**

Replace the first big card (the one that wraps the title + tabs + timeline + KPI) and surrounding markup. Find the current block:

```html
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <div class="flex items-start justify-between flex-wrap gap-3 mb-5">
      <h1 class="text-xl font-bold text-gray-900">SR&amp;ED Projections</h1>
      <div class="flex items-center gap-3 flex-wrap">
        <app-mode-tabs [mode]="mode()" (modeChange)="onModeChange($event)" />
        <button
          type="button"
          class="px-4 py-1.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap">
          Recalculate Projections
        </button>
      </div>
    </div>

    @if (isLoading()) {
      <div class="h-14 animate-pulse bg-gray-100 rounded mb-5"></div>
      <div class="h-20 animate-pulse bg-gray-100 rounded"></div>
    } @else {
      <app-quarterly-timeline
        [tabs]="quarterlyTabs()"
        [selected]="selectedPeriod()"
        [mode]="mode()"
        (periodSelect)="onPeriodSelect($event)" />

      <div class="mt-4">
        <app-dual-kpi-panel
          [currentValue]="currentKpiValue()"
          [projectedValue]="projectedFullYearValue()"
          [mode]="mode()"
          [selectedPeriod]="selectedPeriod()" />
      </div>
    }
  </div>
```

Replace it with:

```html
  <app-page-header title="SR&ED Projections">
    <app-mode-tabs [mode]="mode()" (modeChange)="onModeChange($event)" />
    <button
      type="button"
      (click)="onRecalculate()"
      [disabled]="isRecalculating()"
      class="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
      @if (isRecalculating()) {
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Recalculating…
      } @else {
        Recalculate Projections
      }
    </button>
  </app-page-header>

  <div class="bg-white rounded-lg border border-gray-200 p-5">
    @if (isLoading()) {
      <div class="h-14 animate-pulse bg-gray-100 rounded mb-5"></div>
      <div class="h-20 animate-pulse bg-gray-100 rounded"></div>
    } @else {
      <app-quarterly-timeline
        [tabs]="quarterlyTabs()"
        [selected]="selectedPeriod()"
        [mode]="mode()"
        (periodSelect)="onPeriodSelect($event)" />

      <div class="mt-4">
        <app-dual-kpi-panel
          [currentValue]="currentKpiValue()"
          [projectedValue]="projectedFullYearValue()"
          [mode]="mode()"
          [selectedPeriod]="selectedPeriod()" />
      </div>
    }
  </div>
```

- [ ] **Step 3: Build + tests**

Run: `npx ng build --configuration development && npx vitest run`
Expected: build succeeds, tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/dashboard/dashboard.ts src/app/features/dashboard/dashboard.html
git commit -m "$(cat <<'EOF'
feat: dashboard page header row + Recalculate Projections wire-up

Move mode-tabs and Recalculate button out of the timeline card into a page-level header row. Dissolved the wrapper card; timeline + KPI become a standalone card with no inner title.
Recalculate now shows a spinner for 800ms and pops a toast 'Projections recalculated'.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Promote employee-modal to shared

**Files:**
- Move: `src/app/features/dashboard/components/employee-modal/` → `src/app/shared/components/employee-modal/`
- Modify: `src/app/features/dashboard/dashboard.ts` (update import path)

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/app/shared/components/employee-modal
mv src/app/features/dashboard/components/employee-modal/employee-modal.ts src/app/shared/components/employee-modal/employee-modal.ts
mv src/app/features/dashboard/components/employee-modal/employee-modal.html src/app/shared/components/employee-modal/employee-modal.html
rmdir src/app/features/dashboard/components/employee-modal
```

- [ ] **Step 2: Fix import paths inside employee-modal.ts**

Open `src/app/shared/components/employee-modal/employee-modal.ts`. Update import paths — what was `../../../../core/...` becomes `../../../core/...` (one fewer level deep), and what was `../../models/...` (referring to dashboard models) needs to become `../../../features/dashboard/models/...`.

Concretely, change:

```ts
import { Employee } from '../../../../core/models/employee.model';
import { SredMode, SredProjectBar } from '../../models/chart-data.model';
import { ModeTabsComponent } from '../mode-tabs/mode-tabs';
import { SredProjectsBarComponent } from '../sred-projects-bar/sred-projects-bar';
import { ShortDatePipe } from '../../../../shared/pipes/short-date.pipe';
```

to:

```ts
import { Employee } from '../../../core/models/employee.model';
import { SredMode, SredProjectBar } from '../../../features/dashboard/models/chart-data.model';
import { ModeTabsComponent } from '../../../features/dashboard/components/mode-tabs/mode-tabs';
import { SredProjectsBarComponent } from '../../../features/dashboard/components/sred-projects-bar/sred-projects-bar';
import { ShortDatePipe } from '../../pipes/short-date.pipe';
```

> Cross-feature import of `mode-tabs` and `sred-projects-bar` is acceptable here because the modal lives in `shared/` and pulls from `features/dashboard/` — see Implementation note. If the planning agent disagrees, an alternative is to also promote `mode-tabs` and `sred-projects-bar` to `shared/`, but that's larger scope.

- [ ] **Step 3: Update dashboard.ts import path**

In `src/app/features/dashboard/dashboard.ts`, change:

```ts
import { EmployeeModalComponent } from './components/employee-modal/employee-modal';
```

to:

```ts
import { EmployeeModalComponent } from '../../shared/components/employee-modal/employee-modal';
```

- [ ] **Step 4: Build + tests**

Run: `npx ng build --configuration development && npx vitest run`
Expected: build succeeds, tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/components/employee-modal src/app/features/dashboard/components/employee-modal src/app/features/dashboard/dashboard.ts
git commit -m "$(cat <<'EOF'
refactor: promote employee-modal to shared/components

The modal will be reused by the Employees page in the next commit. Per CLAUDE.md: components used by 2+ features live in shared/.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: TDD the Employees filter+sort calculation

**Files:**
- Create: `src/app/features/employees/calculations/filter-employees.ts`
- Create: `src/app/features/employees/calculations/filter-employees.spec.ts`
- Create: `src/app/features/employees/models/employee-row.ts`

- [ ] **Step 1: Create the extended row model**

Create `src/app/features/employees/models/employee-row.ts`:

```ts
import { EmployeeRow as BaseEmployeeRow } from '../../dashboard/models/chart-data.model';

export type EmployeeStatus = 'active' | 'terminated';

export interface EmployeesPageRow extends BaseEmployeeRow {
  readonly teamName: string;
  readonly status: EmployeeStatus;
}

export type SortKey =
  | 'name' | 'teamName' | 'role' | 'status' | 'hireDate' | 'endDate'
  | 'annualSalary' | 'confirmedSalary' | 'hourlyRate' | 'ytdHours';

export type SortDir = 'asc' | 'desc';

export interface EmployeeFilters {
  readonly search: string;
  readonly team: string | null;
  readonly role: string | null;
  readonly status: EmployeeStatus | null;
}
```

- [ ] **Step 2: Write the failing test**

Create `src/app/features/employees/calculations/filter-employees.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { filterAndSortEmployees } from './filter-employees';
import { EmployeesPageRow } from '../models/employee-row';

function row(overrides: Partial<EmployeesPageRow> = {}): EmployeesPageRow {
  return {
    id: 'e1',
    name: 'Alice',
    role: 'Engineer',
    teamName: 'Platform',
    status: 'active',
    hireDate: '2024-01-01',
    endDate: undefined,
    annualSalary: 100000,
    confirmedSalary: 100000,
    hourlyRate: 50,
    ytdHours: 1000,
    ytdCost: 50000,
    isSpecialEmployee: false,
    ...overrides,
  };
}

describe('filterAndSortEmployees', () => {
  const rows: readonly EmployeesPageRow[] = [
    row({ id: 'e1', name: 'Alice',   teamName: 'Platform', role: 'Engineer',  status: 'active',     hourlyRate: 50, hireDate: '2024-01-01' }),
    row({ id: 'e2', name: 'Bob',     teamName: 'Mobile',   role: 'Engineer',  status: 'active',     hourlyRate: 40, hireDate: '2023-06-01' }),
    row({ id: 'e3', name: 'Charlie', teamName: 'Platform', role: 'Manager',   status: 'terminated', hourlyRate: 60, hireDate: '2022-03-01', endDate: '2025-12-31' }),
  ];

  it('returns all rows when no filters and no sort', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('filters by case-insensitive name search', () => {
    const out = filterAndSortEmployees(rows, { search: 'ali', team: null, role: null, status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e1']);
  });

  it('filters by team', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: 'Mobile', role: null, status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e2']);
  });

  it('filters by role', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: 'Manager', status: null }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e3']);
  });

  it('filters by status', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: 'terminated' }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e3']);
  });

  it('combines multiple filters', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: 'Platform', role: null, status: 'active' }, null, 'asc');
    expect(out.map(r => r.id)).toEqual(['e1']);
  });

  it('sorts by hourlyRate ascending', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'hourlyRate', 'asc');
    expect(out.map(r => r.hourlyRate)).toEqual([40, 50, 60]);
  });

  it('sorts by hourlyRate descending', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'hourlyRate', 'desc');
    expect(out.map(r => r.hourlyRate)).toEqual([60, 50, 40]);
  });

  it('sorts by name string ascending', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'name', 'asc');
    expect(out.map(r => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('puts undefined endDate last when sorting asc by endDate', () => {
    const out = filterAndSortEmployees(rows, { search: '', team: null, role: null, status: null }, 'endDate', 'asc');
    expect(out.map(r => r.id)).toEqual(['e3', 'e1', 'e2']);
  });
});
```

- [ ] **Step 3: Run test — confirm it fails**

Run: `npx vitest run filter-employees`
Expected: FAIL — `filterAndSortEmployees` is not defined.

- [ ] **Step 4: Implement the calculation**

Create `src/app/features/employees/calculations/filter-employees.ts`:

```ts
import { EmployeesPageRow, EmployeeFilters, SortKey, SortDir } from '../models/employee-row';

export function filterAndSortEmployees(
  rows: readonly EmployeesPageRow[],
  filters: EmployeeFilters,
  sortKey: SortKey | null,
  sortDir: SortDir,
): readonly EmployeesPageRow[] {
  const search = filters.search.trim().toLowerCase();
  const filtered = rows.filter(r => {
    if (search && !r.name.toLowerCase().includes(search)) return false;
    if (filters.team && r.teamName !== filters.team) return false;
    if (filters.role && r.role !== filters.role) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  if (!sortKey) return filtered;
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => compareBy(a, b, sortKey) * dir);
}

function compareBy(a: EmployeesPageRow, b: EmployeesPageRow, key: SortKey): number {
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av).localeCompare(String(bv));
}
```

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npx vitest run filter-employees`
Expected: PASS — all 10 tests.

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: 62+ tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/features/employees
git commit -m "$(cat <<'EOF'
feat: filterAndSortEmployees pure function + spec

Filter by search/team/role/status, sort by any column with null-last semantics. TDD: 10 specs cover the filter/sort matrix.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Employees page + table + route

**Files:**
- Create: `src/app/features/employees/employees-page.ts`
- Create: `src/app/features/employees/employees-page.html`
- Create: `src/app/features/employees/components/employees-table.ts`
- Create: `src/app/features/employees/components/employees-table.html`
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Create the employees-table presentational component**

Create `src/app/features/employees/components/employees-table.html`:

```html
<div class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
  <table class="w-full text-sm text-left text-gray-500">
    <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
      <tr>
        <th class="px-5 py-3">
          <button type="button" (click)="sort.emit('name')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Name <span class="text-[10px]">{{ arrow('name') }}</span>
          </button>
        </th>
        <th class="px-5 py-3">
          <button type="button" (click)="sort.emit('teamName')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Team <span class="text-[10px]">{{ arrow('teamName') }}</span>
          </button>
        </th>
        <th class="px-5 py-3">
          <button type="button" (click)="sort.emit('role')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Role <span class="text-[10px]">{{ arrow('role') }}</span>
          </button>
        </th>
        <th class="px-5 py-3">
          <button type="button" (click)="sort.emit('status')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Status <span class="text-[10px]">{{ arrow('status') }}</span>
          </button>
        </th>
        <th class="px-5 py-3">
          <button type="button" (click)="sort.emit('hireDate')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Start <span class="text-[10px]">{{ arrow('hireDate') }}</span>
          </button>
        </th>
        <th class="px-5 py-3">
          <button type="button" (click)="sort.emit('endDate')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            End <span class="text-[10px]">{{ arrow('endDate') }}</span>
          </button>
        </th>
        <th class="px-5 py-3 text-right">
          <button type="button" (click)="sort.emit('annualSalary')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Expected <span class="text-[10px]">{{ arrow('annualSalary') }}</span>
          </button>
        </th>
        <th class="px-5 py-3 text-right">
          <button type="button" (click)="sort.emit('hourlyRate')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Hourly Rate <span class="text-[10px]">{{ arrow('hourlyRate') }}</span>
          </button>
        </th>
        <th class="px-5 py-3 text-right">
          <button type="button" (click)="sort.emit('ytdHours')" class="inline-flex items-center gap-1 uppercase hover:text-gray-900">
            Hours <span class="text-[10px]">{{ arrow('ytdHours') }}</span>
          </button>
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      @for (row of rows(); track row.id) {
        <tr class="bg-white hover:bg-gray-50 cursor-pointer" (click)="rowClick.emit(row.id)">
          <td class="px-5 py-3 font-medium text-gray-900">{{ row.name }}</td>
          <td class="px-5 py-3">{{ row.teamName }}</td>
          <td class="px-5 py-3">{{ row.role }}</td>
          <td class="px-5 py-3">
            <span
              [class]="'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ' + (row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')">
              {{ row.status === 'active' ? 'Active' : 'Terminated' }}
            </span>
          </td>
          <td class="px-5 py-3">{{ row.hireDate | shortDate }}</td>
          <td class="px-5 py-3">{{ row.endDate ? (row.endDate | shortDate) : '—' }}</td>
          <td class="px-5 py-3 text-right">{{ row.annualSalary | currency:'CAD':'symbol-narrow':'1.0-0' }}</td>
          <td class="px-5 py-3 text-right">{{ row.hourlyRate | currency:'CAD':'symbol-narrow':'1.2-2' }}</td>
          <td class="px-5 py-3 text-right">{{ row.ytdHours | number:'1.0-0' }}</td>
        </tr>
      }
      @if (rows().length === 0) {
        <tr><td colspan="9" class="px-5 py-8 text-center text-gray-400">No employees match your filters.</td></tr>
      }
    </tbody>
  </table>
</div>
```

Create `src/app/features/employees/components/employees-table.ts`:

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmployeesPageRow, SortKey, SortDir } from '../models/employee-row';
import { ShortDatePipe } from '../../../shared/pipes/short-date.pipe';

@Component({
  selector: 'app-employees-table',
  imports: [CurrencyPipe, DecimalPipe, ShortDatePipe],
  templateUrl: './employees-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesTableComponent {
  readonly rows = input.required<readonly EmployeesPageRow[]>();
  readonly sortKey = input<SortKey | null>(null);
  readonly sortDir = input<SortDir>('asc');
  readonly sort = output<SortKey>();
  readonly rowClick = output<string>();

  arrow(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }
}
```

- [ ] **Step 2: Create the employees page template**

Create `src/app/features/employees/employees-page.html`:

```html
<div class="space-y-5">
  <app-page-header
    title="Employees"
    [subtitle]="filteredRows().length + ' of ' + allRows().length + ' employees'" />

  <div class="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
    <div class="relative flex-1 min-w-[200px]">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input
        type="text"
        [value]="search()"
        (input)="onSearchInput($event)"
        placeholder="Search by name…"
        class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>

    <select
      [value]="teamFilter() ?? ''"
      (change)="onTeamChange($event)"
      class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <option value="">All teams</option>
      @for (t of availableTeams(); track t) {
        <option [value]="t">{{ t }}</option>
      }
    </select>

    <select
      [value]="roleFilter() ?? ''"
      (change)="onRoleChange($event)"
      class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <option value="">All roles</option>
      @for (r of availableRoles(); track r) {
        <option [value]="r">{{ r }}</option>
      }
    </select>

    <select
      [value]="statusFilter() ?? ''"
      (change)="onStatusChange($event)"
      class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <option value="">All statuses</option>
      <option value="active">Active</option>
      <option value="terminated">Terminated</option>
    </select>
  </div>

  <app-employees-table
    [rows]="filteredRows()"
    [sortKey]="sortKey()"
    [sortDir]="sortDir()"
    (sort)="onSort($event)"
    (rowClick)="onRowClick($event)" />
</div>

@if (selectedEmployee(); as emp) {
  <app-employee-modal
    [employee]="emp"
    [projectBars]="[]"
    [sredHours]="0"
    [sredCost]="0"
    [sredCredits]="0"
    [totalHours]="0"
    [periodLabel]="''"
    [mode]="'hours'"
    (close)="closeModal()"
    (modeChange)="noop()" />
}
```

> Note: the Employees page opens the modal in a lightweight read-only state (no per-period stats). If detailed stats are required, that's future work — the modal already handles empty inputs gracefully (totals show 0).

- [ ] **Step 3: Create the employees page class**

Create `src/app/features/employees/employees-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmployeesService } from '../dashboard/services/employees.service';
import { TeamsService } from '../dashboard/services/teams.service';
import { TimeEntriesService } from '../dashboard/services/time-entries.service';
import { hourlyRate } from '../dashboard/calculations';
import { Employee } from '../../core/models/employee.model';
import { Team } from '../../core/models/team.model';
import { TimeEntry } from '../dashboard/models/time-entry.model';
import { EmployeesPageRow, EmployeeFilters, EmployeeStatus, SortKey, SortDir } from './models/employee-row';
import { filterAndSortEmployees } from './calculations/filter-employees';
import { EmployeesTableComponent } from './components/employees-table';
import { PageHeaderComponent } from '../../core/components/page-header/page-header';
import { EmployeeModalComponent } from '../../shared/components/employee-modal/employee-modal';
import { SredMode } from '../dashboard/models/chart-data.model';

@Component({
  selector: 'app-employees-page',
  imports: [EmployeesTableComponent, PageHeaderComponent, EmployeeModalComponent],
  templateUrl: './employees-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesPageComponent {
  private readonly employeesSvc = inject(EmployeesService);
  private readonly teamsSvc = inject(TeamsService);
  private readonly timeEntriesSvc = inject(TimeEntriesService);

  readonly employees = toSignal<readonly Employee[], readonly Employee[]>(
    this.employeesSvc.getAll(), { initialValue: [] },
  );
  readonly teams = toSignal<readonly Team[], readonly Team[]>(
    this.teamsSvc.getAll(), { initialValue: [] },
  );
  readonly timeEntries = toSignal<readonly TimeEntry[], readonly TimeEntry[]>(
    this.timeEntriesSvc.getAll(), { initialValue: [] },
  );

  readonly search = signal('');
  readonly teamFilter = signal<string | null>(null);
  readonly roleFilter = signal<string | null>(null);
  readonly statusFilter = signal<EmployeeStatus | null>(null);
  readonly sortKey = signal<SortKey | null>(null);
  readonly sortDir = signal<SortDir>('asc');

  readonly selectedEmployeeId = signal<string | null>(null);

  readonly allRows = computed<readonly EmployeesPageRow[]>(() => {
    const teamsById = new Map(this.teams().map(t => [t.id, t.name]));
    const hoursByEmp = new Map<string, number>();
    for (const e of this.timeEntries()) {
      hoursByEmp.set(e.employeeId, (hoursByEmp.get(e.employeeId) ?? 0) + e.hours);
    }
    return this.employees().map(emp => {
      const rate = hourlyRate(emp);
      const ytdHours = hoursByEmp.get(emp.id) ?? 0;
      const status: EmployeeStatus = emp.endDate ? 'terminated' : 'active';
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        teamName: emp.teamId ? (teamsById.get(emp.teamId) ?? 'Unknown') : 'Unassigned',
        status,
        hireDate: emp.hireDate,
        endDate: emp.endDate,
        annualSalary: emp.annualSalary,
        confirmedSalary: emp.confirmedSalary,
        isSpecialEmployee: emp.isSpecialEmployee ?? false,
        hourlyRate: rate,
        ytdHours,
        ytdCost: ytdHours * rate,
      };
    });
  });

  readonly availableTeams = computed(() =>
    Array.from(new Set(this.allRows().map(r => r.teamName))).sort()
  );
  readonly availableRoles = computed(() =>
    Array.from(new Set(this.allRows().map(r => r.role))).sort()
  );

  readonly filters = computed<EmployeeFilters>(() => ({
    search: this.search(),
    team: this.teamFilter(),
    role: this.roleFilter(),
    status: this.statusFilter(),
  }));

  readonly filteredRows = computed(() =>
    filterAndSortEmployees(this.allRows(), this.filters(), this.sortKey(), this.sortDir())
  );

  readonly selectedEmployee = computed(() => {
    const id = this.selectedEmployeeId();
    return id ? (this.employees().find(e => e.id === id) ?? null) : null;
  });

  onSearchInput(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }
  onTeamChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.teamFilter.set(v || null);
  }
  onRoleChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.roleFilter.set(v || null);
  }
  onStatusChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value as EmployeeStatus | '';
    this.statusFilter.set(v || null);
  }

  onSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  onRowClick(employeeId: string): void {
    this.selectedEmployeeId.set(employeeId);
  }
  closeModal(): void { this.selectedEmployeeId.set(null); }
  noop(_: SredMode): void { /* mode switching not wired on this page */ }
}
```

- [ ] **Step 4: Register the route**

In `src/app/app.routes.ts`, inside the `children` array of the tenant-layout route, add the employees route after dashboard:

```ts
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employees-page').then(m => m.EmployeesPageComponent),
      },
```

- [ ] **Step 5: Build + tests**

Run: `npx ng build --configuration development && npx vitest run`
Expected: build succeeds; 62+ tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/features/employees src/app/app.routes.ts
git commit -m "$(cat <<'EOF'
feat: add Employees page with search, filter, sortable table

New route /tenant/:tenantId/employees. Search by name, filter by team/role/status, sort any column. Row click opens the (shared) employee modal in a lightweight read-only state.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: End-to-end browser verification

- [ ] **Step 1: Start the dev server**

```bash
npx ng serve --port 4200 --host 127.0.0.1
```

Wait for "Local: http://127.0.0.1:4200/".

- [ ] **Step 2: Walk through each spec verification item**

Open http://127.0.0.1:4200/ in a browser, log in with any email + 4+ char password, then verify each item from the spec's Verification section:

1. **Chrome:** Logo in sidebar top. Tenant selector in top bar. Search and bell icons fire toasts on click. Avatar dropdown works.
2. **Sidebar menus:** Dashboard / Employees / Reports (SOON) / Audits (SOON) / Settings (SOON) / Help visible. SOON items don't navigate; hover shows tooltip "Coming soon".
3. **Employees page:** Title "Employees", subtitle "7 of 7". Search filters by name. Team/Role/Status filters work. Column headers sort. Row click opens modal.
4. **Claim period dropdown:** Defaults to 2026. Click dropdown → 2024, 2025, 2026 listed. Select 2024 → dashboard updates.
5. **Mode-tabs / Recalculate placement:** Above all cards in a page header row, not inside a card.
6. **Multi-year data:** With 2026 active, YTD has ~5 months of data, Q1 full, Q2 partial, Q3/Q4 zero. With 2024 active, all quarters full.
7. **Tooltip:** Long text wraps; short text stays one line.
8. **Projects bar truncate:** Narrow segments truncate with `…` instead of overflowing.
9. **Recalculate:** Button shows spinner 800ms, then toast "Projections recalculated" bottom-right.
10. **Build + tests:** Already confirmed at each task.

- [ ] **Step 3: Stop the dev server when done**

(For local Bash, Ctrl-C. For agentic execution, use TaskStop on the background task.)

---

## Self-Review Notes

- **Spec coverage:** Every spec section (1 chrome, 2 employees, 3 dashboard refinements) maps to tasks. Section 1 → Tasks 7, 8, 9. Section 2 → Tasks 12, 13, 14. Section 3 → Tasks 1 (3d/3e), 3–5 (3b/3c), 6 (3b), 10 (page header), 11 (3a/3f).
- **Placeholders:** None remain. The "future work" note on the Employees-page modal (lightweight stats) is intentional and called out in Task 14.
- **Type consistency:** `EmployeesPageRow` is defined in Task 13 and consumed in Tasks 13 + 14. `SortKey`/`SortDir`/`EmployeeFilters` all flow through unchanged.
- **Cross-feature import in Task 12:** Acknowledged as a one-off; alternative noted (also promote mode-tabs + sred-projects-bar).
