# Staff Gauge Animation + Display Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the SR&ED gauge arc on load and add a section-level SR&ED / Unclaimed / Both toggle that swaps what the gauge center displays.

**Architecture:** Add a `StaffDisplayMode` type to the shared model, wire an animated CSS `stroke-dasharray` onto the card's SR&ED arc, add three new `computed()` signals to the card component for the center text, then add a `signal<StaffDisplayMode>` + pill toggle to the section component that passes the mode down to each card.

**Tech Stack:** Angular 21, standalone components, OnPush + zoneless, CSS `@keyframes`, CSS custom properties (`--target-dash`), SVG stroke-dasharray.

---

## File Map

| File | Action |
|------|--------|
| `src/app/features/dashboard/models/chart-data.model.ts` | Add `StaffDisplayMode` type |
| `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.scss` | **Create** — gauge animation keyframes |
| `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts` | Add `displayMode` input + 3 new computeds + `styleUrl` |
| `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html` | Animate arc, update center text, update sub-label condition |
| `src/app/features/dashboard/components/staff-section/staff-section.ts` | Add `displayMode` signal, `displayModeOptions`, `setDisplayMode()` |
| `src/app/features/dashboard/components/staff-section/staff-section.html` | Add toggle pill to header; pass `[displayMode]` to cards |

---

## Task 1: Add StaffDisplayMode type

**Files:**
- Modify: `src/app/features/dashboard/models/chart-data.model.ts`

- [ ] **Step 1: Add the type**

  Open `src/app/features/dashboard/models/chart-data.model.ts`. After the existing type declarations at the top of the file, add:

  ```ts
  export type StaffDisplayMode = 'sred' | 'unclaimed' | 'both';
  ```

  The file currently has `SredMode`, `ChartView`, etc. as string literal union types on lines 1–4. Add the new line immediately after `export type ChartView = 'bar' | 'donut';`.

- [ ] **Step 2: Verify it compiles**

  ```bash
  npm run build 2>&1 | tail -5
  ```

  Expected: build succeeds (exit 0). No errors about the new type — it's just a declaration.

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/features/dashboard/models/chart-data.model.ts
  git commit -m "feat: add StaffDisplayMode type"
  ```

---

## Task 2: Gauge fill animation (CSS + arc template)

**Files:**
- Create: `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.scss`
- Modify: `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts`
- Modify: `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html`

- [ ] **Step 1: Create the SCSS file**

  Create `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.scss` with this content:

  ```scss
  @keyframes gauge-fill {
    from { stroke-dasharray: 0 113; }
    to   { stroke-dasharray: var(--target-dash, 85) 113; }
  }

  .gauge-arc-animated {
    stroke-dasharray: 0 113;
    animation: gauge-fill 900ms cubic-bezier(0.4, 0, 0.2, 1) 200ms forwards;
  }
  ```

  The animation starts empty (`0 113`) and sweeps to whatever `--target-dash` CSS custom property is set on the element. The 200 ms delay lets the card finish its enter paint before the arc starts moving.

- [ ] **Step 2: Reference the SCSS from the component**

  Open `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts`. Add `styleUrl` to the `@Component` decorator:

  ```ts
  @Component({
    selector: 'app-staff-employee-card',
    imports: [AvatarComponent],
    templateUrl: './staff-employee-card.html',
    styleUrl: './staff-employee-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  ```

- [ ] **Step 3: Update the SR&ED arc path in the template**

  Open `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html`.

  Find the SR&ED arc `<path>` — currently it looks like this:

  ```html
  <!-- SR&ED arc layer -->
  <path
    d="M4,44 A36,36 0 0,1 76,44"
    [attr.stroke]="entry().color"
    stroke-width="8"
    fill="none"
    stroke-linecap="round"
    [attr.stroke-dasharray]="sreddash() + ' ' + remaining()" />
  ```

  Replace it with:

  ```html
  <!-- SR&ED arc layer -->
  <path
    class="gauge-arc-animated"
    [style.--target-dash]="sreddash()"
    d="M4,44 A36,36 0 0,1 76,44"
    [attr.stroke]="entry().color"
    stroke-width="8"
    fill="none"
    stroke-linecap="round" />
  ```

  Key changes:
  - Added `class="gauge-arc-animated"` — applies the animation
  - Added `[style.--target-dash]="sreddash()"` — sets the CSS custom property to the computed SR&ED dash length (e.g. `"85.3"`)
  - Removed `[attr.stroke-dasharray]` — the animation now owns `stroke-dasharray`

- [ ] **Step 4: Build to verify no type errors**

  ```bash
  npm run build 2>&1 | tail -10
  ```

  Expected: build succeeds (exit 0).

- [ ] **Step 5: Visual check**

  Run `npm start` and open the dashboard. Reload the page and watch the staff section — each gauge arc should sweep from empty to its filled position over ~900 ms. If you navigate away and back, the animation replays on re-mount.

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/features/dashboard/components/staff-employee-card/staff-employee-card.scss \
          src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts \
          src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html
  git commit -m "feat: animate staff gauge arc fill on mount"
  ```

---

## Task 3: displayMode input + center text computeds on card

**Files:**
- Modify: `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts`
- Modify: `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html`

- [ ] **Step 1: Add the import and input**

  Open `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts`.

  Add `StaffDisplayMode` to the model import:

  ```ts
  import { SredMode, StaffBarEntry, StaffDisplayMode } from '../../models/chart-data.model';
  ```

  Add the new input after `readonly mode = input<SredMode>('hours');`:

  ```ts
  readonly displayMode = input<StaffDisplayMode>('both');
  ```

- [ ] **Step 2: Add the three new computeds**

  Add these after the existing `readonly gaugeLabel` computed:

  ```ts
  readonly centerValue = computed(() => {
    if (this.displayMode() === 'unclaimed') {
      return this.mode() === 'hours'
        ? Math.round(this.entry().unclaimedValue).toLocaleString('en-CA')
        : CAD_FORMATTER.format(this.entry().unclaimedValue);
    }
    return this.sredDisplay();
  });

  readonly centerLabel = computed(() => {
    if (this.displayMode() === 'unclaimed') {
      return this.mode() === 'hours' ? 'unclaimed hrs' : 'unclaimed $';
    }
    return this.gaugeLabel();
  });

  readonly showUnclaimedSubLabel = computed(() =>
    this.displayMode() !== 'unclaimed' && this.mode() !== 'credits'
  );
  ```

- [ ] **Step 3: Update the template center text**

  Open `src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html`.

  Find the two `<text>` elements inside the SVG (center value and label):

  ```html
  <!-- Center text: SR&ED value -->
  <text x="40" y="35" text-anchor="middle" font-size="12" font-weight="700" fill="#111827">{{ sredDisplay() }}</text>
  <text x="40" y="45" text-anchor="middle" font-size="6" fill="#9ca3af">{{ gaugeLabel() }}</text>
  ```

  Replace with:

  ```html
  <!-- Center text: value driven by displayMode -->
  <text x="40" y="35" text-anchor="middle" font-size="12" font-weight="700" fill="#111827">{{ centerValue() }}</text>
  <text x="40" y="45" text-anchor="middle" font-size="6" fill="#9ca3af">{{ centerLabel() }}</text>
  ```

- [ ] **Step 4: Update the unclaimed sub-label condition**

  Find the existing unclaimed sub-label block:

  ```html
  @if (mode() !== 'credits') {
    <p class="text-xs text-gray-400 self-start">{{ unclaimedDisplay() }}</p>
  }
  ```

  Replace with:

  ```html
  @if (showUnclaimedSubLabel()) {
    <p class="text-xs text-gray-400 self-start">{{ unclaimedDisplay() }}</p>
  }
  ```

- [ ] **Step 5: Build to verify**

  ```bash
  npm run build 2>&1 | tail -10
  ```

  Expected: build succeeds (exit 0). The `displayMode` input defaults to `'both'`, so the existing dashboard behavior is unchanged — SR&ED value still shows in the center.

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/features/dashboard/components/staff-employee-card/staff-employee-card.ts \
          src/app/features/dashboard/components/staff-employee-card/staff-employee-card.html
  git commit -m "feat: add displayMode input and center text computeds to staff employee card"
  ```

---

## Task 4: Section-level toggle

**Files:**
- Modify: `src/app/features/dashboard/components/staff-section/staff-section.ts`
- Modify: `src/app/features/dashboard/components/staff-section/staff-section.html`

- [ ] **Step 1: Add signal and options to StaffSectionComponent**

  Open `src/app/features/dashboard/components/staff-section/staff-section.ts`.

  Add `signal` to the Angular core import (it's already imported — add it if missing):

  ```ts
  import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
  ```

  Add `StaffDisplayMode` to the model import:

  ```ts
  import { SredMode, StaffBarEntry, StaffDisplayMode } from '../../models/chart-data.model';
  ```

  Inside the class body, add after `readonly groups = computed(...)`:

  ```ts
  readonly displayMode = signal<StaffDisplayMode>('sred');

  readonly displayModeOptions: readonly { value: StaffDisplayMode; label: string }[] = [
    { value: 'sred', label: 'SR&ED' },
    { value: 'unclaimed', label: 'Unclaimed' },
    { value: 'both', label: 'Both' },
  ];

  setDisplayMode(m: StaffDisplayMode): void {
    this.displayMode.set(m);
  }
  ```

- [ ] **Step 2: Add the toggle pill to the section header**

  Open `src/app/features/dashboard/components/staff-section/staff-section.html`.

  Find the existing header `<div>`:

  ```html
  <div class="flex items-center gap-2">
    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.48-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.48.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <h2 class="text-base font-semibold text-gray-900 inline-flex items-center gap-1.5">
      Total Staff Included in Claim ({{ totalCount() }})
      <app-info-tooltip text="All employees on the client roster, grouped by team. The gauge shows SR&ED eligible hours as a proportion of total hours. Click a card to view employee project breakdown." />
    </h2>
  </div>
  ```

  Replace with:

  ```html
  <div class="flex items-center gap-2 flex-wrap">
    <svg class="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.48-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.48.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <h2 class="text-base font-semibold text-gray-900 inline-flex items-center gap-1.5">
      Total Staff Included in Claim ({{ totalCount() }})
      <app-info-tooltip text="All employees on the client roster, grouped by team. The gauge shows SR&ED eligible hours as a proportion of total hours. Click a card to view employee project breakdown." />
    </h2>
    <div class="ml-auto flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
      @for (opt of displayModeOptions; track opt.value) {
        <button
          type="button"
          class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
          [class.bg-white]="displayMode() === opt.value"
          [class.shadow-sm]="displayMode() === opt.value"
          [class.text-gray-900]="displayMode() === opt.value"
          [class.text-gray-500]="displayMode() !== opt.value"
          (click)="setDisplayMode(opt.value)">
          {{ opt.label }}
        </button>
      }
    </div>
  </div>
  ```

- [ ] **Step 3: Pass displayMode to each card**

  In the same file, find the `<app-staff-employee-card>` element inside the `@for` block:

  ```html
  <app-staff-employee-card
    [entry]="entry"
    [mode]="mode()"
    (viewDetails)="employeeClick.emit(entry.employeeId)" />
  ```

  Replace with:

  ```html
  <app-staff-employee-card
    [entry]="entry"
    [mode]="mode()"
    [displayMode]="displayMode()"
    (viewDetails)="employeeClick.emit(entry.employeeId)" />
  ```

- [ ] **Step 4: Build to verify**

  ```bash
  npm run build 2>&1 | tail -10
  ```

  Expected: build succeeds (exit 0).

- [ ] **Step 5: Visual check**

  Run `npm start`. Open the dashboard and scroll to the Staff section:

  - The section header should show a pill toggle: **SR&ED | Unclaimed | Both**
  - Default active: **SR&ED** — gauge centers show SR&ED hours/$ value; unclaimed sub-label visible beneath name
  - Click **Unclaimed** — gauge centers swap to unclaimed value + label; sub-label hidden
  - Click **Both** — gauge centers show SR&ED value again; unclaimed sub-label reappears
  - Switch the top mode tabs (Hours → Expenditures) — all values update correctly across all toggle states
  - Reload the page — gauge arcs animate on load in all three toggle modes

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/features/dashboard/components/staff-section/staff-section.ts \
          src/app/features/dashboard/components/staff-section/staff-section.html
  git commit -m "feat: add SR&ED / Unclaimed / Both toggle to staff section"
  ```
