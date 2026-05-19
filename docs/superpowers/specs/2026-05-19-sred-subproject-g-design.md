# Sub-project G: UX Refinements — Design Spec

> Date: 2026-05-19
> Sub-project: G (follows F UI polish)
> Today's app date: 2026-05-19

## Context

Sub-project F polished the dashboard at the component level. Round of user feedback after F raised seven items spanning chrome (navbar/sidebar redesign), one new feature (Employees page), and dashboard refinements (claim period selector, mode-tabs placement, multi-year data, tooltip behavior, projects bar truncate bug, Recalculate Projections wire-up).

User provided ChainScope screenshots as the visual reference for the chrome redesign. The goal is to converge on that layout pattern while keeping our existing functionality (collapsible sidebar, tenant switcher, avatar dropdown) and adding three disabled menu placeholders for upcoming features.

## Section 1 — Chrome redesign

### Layout

The current top header (logo + sidebar toggle + tenant + avatar) is replaced by:

- **Left column (fixed):** sidebar with logo at top, menu items, footer Help link.
- **Right column:** top bar (tenant selector left, search/bell/avatar right) + main content below.

```
+------------+-----------------------------------------------+
| [logo]     | [tenant ▾]              [🔍] [🔔] [avatar ▾] |
| sred.io    +-----------------------------------------------+
|            |                                                |
| Dashboard  |   Page header (title + page controls)         |
| Employees  |                                                |
| Reports    |   Content cards                                |
|   [SOON]   |                                                |
| Audits     |                                                |
|   [SOON]   |                                                |
| Settings   |                                                |
|   [SOON]   |                                                |
|            |                                                |
| [Help]     |                                                |
+------------+-----------------------------------------------+
```

### Sidebar

- Width: ~14rem expanded, ~4rem collapsed (collapsible toggle preserved).
- Logo: "sred.io" wordmark + 'S' badge at top.
- Items: Dashboard, Employees, Reports, Audits, Settings.
- Active item: green left-pill (border-l-4 border-blue-600 + bg-blue-50 text-blue-700 — matches existing color scheme; reference uses green, we keep blue for brand consistency with existing dashboard).
- Disabled items (Reports/Audits/Settings): `aria-disabled="true"`, `cursor-not-allowed`, gray text, gray "SOON" badge on the right. Click → no navigation; hover → tooltip "Coming soon".
- Footer: "Help" link as `<a href="mailto:success@sred.io">`. Renders below the items, separated by a thin border.
- Collapsed state: items show only icons; SOON badges hide; tooltips on hover show full label.

### Top bar

- Spans only the right column (over main content, not over sidebar).
- Height: ~3.5rem.
- Left: tenant switcher (same dropdown component / behavior as today, relocated).
- Right cluster (`gap-2`):
  - Search icon button: on click, fires toast "Search coming soon". Tooltip "Search (coming soon)" on hover.
  - Notification bell icon button: shows an unread dot (purely cosmetic). On click, fires toast "Notifications coming soon". Tooltip "Notifications (coming soon)" on hover.
  - Avatar + dropdown: existing `app-avatar` + dropdown (My Profile, Sign out) — moved from current navbar.

### Toast component

- New file: `src/app/shared/components/toast/toast.ts` + `toast.html`.
- API: small `ToastService` (in `shared/services/toast.service.ts`) with a `show(message: string, duration = 2500)` method that pushes to a signal array of active toasts.
- Renders: fixed bottom-right, stacked vertically, fade-in/out. Used by "coming soon" clicks and the Recalculate button (Section 3f).

### Files

- New: `src/app/core/components/top-bar/top-bar.{ts,html}`
- Modified: `src/app/core/components/side-bar/side-bar.{ts,html}` — new items, logo, footer, SOON badges
- Modified: `src/app/core/components/authenticated-layout/authenticated-layout.{ts,html}` — flex layout
- Removed/renamed: `src/app/core/components/nav-bar/` — replaced by top-bar (delete `nav-bar.{ts,html}`)
- New: `src/app/shared/components/toast/toast.{ts,html}`
- New: `src/app/shared/services/toast.service.ts`

## Section 2 — Employees page

### Route

- `/tenant/:tenantId/employees` — added to `app.routes.ts` under the authenticated layout.

### Page structure

- Page header row (matches Section 3a pattern): title "Employees" + subtitle "{filteredCount} of {totalCount} employees" on left. No right-side button.
- Filters row: search input (placeholder "Search by name…") + Team dropdown + Role dropdown + Status dropdown.
- Table: every column sortable (asc/desc/none with arrow indicator). Columns:
  - Name
  - Team (string, sortable)
  - Role
  - Status (badge: Active / Terminated based on `endDate`)
  - Start Date
  - End Date
  - Expected Salary
  - Confirmed Salary
  - Hourly Rate
  - Hours Worked (YTD across all years in mock data)
- Click row → open `EmployeeModalComponent` (modal lives in `shared/` after promotion — see "Modal reuse decision" below).

### Components

- New: `src/app/features/employees/employees-page.{ts,html}` — smart container.
- New: `src/app/features/employees/components/employees-table.{ts,html}` — presentational.
- New: `src/app/features/employees/models/employee-row.model.ts` — extended `EmployeeRow` with `teamName: string` and `status: 'active' | 'terminated'` fields.

### Filter / sort state

All in `employees-page.ts`:

- `searchTerm = signal('')`
- `teamFilter = signal<string | null>(null)` (null = all)
- `roleFilter = signal<string | null>(null)`
- `statusFilter = signal<'active' | 'terminated' | null>(null)`
- `sortKey = signal<keyof EmployeeRow | null>(null)`
- `sortDir = signal<'asc' | 'desc'>('asc')`
- `filteredSortedRows = computed(...)` — applies all four filters then sort.

### Data

- Reuses `EmployeesService.getAll()`, `TeamsService.getAll()`, `TimeEntriesService.getAll()`.
- Hours Worked = sum across the entire mock data range (all years) for parity with the Suppliers-style "lifetime" view.
- All client-side, signal-based.

### Modal reuse decision

The `EmployeeModalComponent` currently lives at `features/dashboard/components/employee-modal/`. Per CLAUDE.md ("When two features need the same thing, move it to `shared/`"), promote it to `src/app/shared/components/employee-modal/`. Update imports in `dashboard.ts` and add import in `employees-page.ts`.

### Sidebar integration

Sidebar's Employees item routes to `/tenant/:tenantId/employees`. Active state when route matches.

### Files

- New: `src/app/features/employees/employees-page.{ts,html}`
- New: `src/app/features/employees/components/employees-table.{ts,html}`
- New: `src/app/features/employees/models/employee-row.model.ts` (or extend existing model — see Implementation note)
- Moved: `src/app/features/dashboard/components/employee-modal/` → `src/app/shared/components/employee-modal/`
- Modified: `src/app/app.routes.ts` — new route
- Modified: `src/app/features/dashboard/dashboard.ts` — update modal import path

> Implementation note: the existing `EmployeeRow` type lives in `features/dashboard/models/chart-data.model.ts`. For the Employees page, extend it (compose `EmployeeRow & { teamName: string; status: ... }`) rather than duplicating. May warrant promoting the base `EmployeeRow` to a shared model — decide during planning.

## Section 3 — Dashboard refinements

### 3a — Page header row

- New row above all cards in `dashboard.html`: title "SR&ED Projections" on left, mode-tabs in middle, "Recalculate Projections" button on right.
- The current first card (the wrapper that holds title + tabs + timeline + KPI) is dissolved. Its inner children — quarterly-timeline and dual-kpi-panel — become the first standalone card with no inner title row.
- Page header is reusable: extract `core/components/page-header/page-header.{ts,html}` taking `title`, `subtitle?`, content slot for right-side controls. (Used by Employees page too.)

### 3b — Claim period dropdown

#### Data model change

- Replace `Client.claimPeriod: ClaimPeriod` with `Client.claimPeriods: readonly ClaimPeriod[]` (ordered ascending by `startDate`).
- `ClaimPeriod` keeps existing shape: `{ id, startDate, endDate }` (add an `id` field; can be the year as a string for simplicity, e.g., `"2026"`).

#### Dashboard state

- Add `activeClaimPeriodId = signal<string | null>(null)` in `dashboard.ts`.
- Compute `activeClaimPeriod` from `client().claimPeriods` and `activeClaimPeriodId()`.
- Default selection: the period containing `asOf` (today). Use a `computed` initial value or an `effect` that sets the signal when client first loads.
- Every downstream computed currently reads `client().claimPeriod.startDate/endDate` — replace with `activeClaimPeriod().startDate/endDate`. Touch sites: `periodEntries`, `quarterlyTabs`, `projectedFullYearValue`, `employeeRows`, `modalPeriodLabel`.

#### Client header UI

- `client-header.html`: dropdown over the period start/end text (chevron + dropdown panel like the tenant switcher).
- Options list shows each period as "Jan 1, 2024 – Dec 31, 2024" etc.
- Selected item gets a checkmark.

### 3c — Multi-year mock data

#### Clients

- Each client gets `claimPeriods` for 2024, 2025, and 2026. Period boundaries: Jan 1 – Dec 31 for each year.

#### Time entries

- Existing `time-entries.mock.ts` uses a seeded RNG to generate entries within a single year. Extend the loop to span 2024-01-01 through 2026-05-19.
- 2026 entries stop at "today" (2026-05-19) so partial-Q2 + projections show real data.
- Volume target: similar per-day density as today (~10–30 entries/day across all employees). Total grows ~2.4× — verify performance is still snappy.

#### Verification

- After change: YTD tab on Dashboard shows ~5 months of 2026 data; projection extrapolates to full year. Q1 2026 shows complete data, Q2 partial, Q3/Q4 zero.

### 3d — Tooltip multiline + dynamic width

- `src/app/shared/directives/tooltip.directive.ts`: remove the `whitespace-nowrap` class from the rendered tooltip element.
- Keep `max-w-xs` (~20rem) so very long text wraps to multiple lines rather than running off screen.
- Short text (single-line) renders unchanged (no nowrap → no forced single line, but content stays on one line if it fits).

### 3e — Projects bar truncate fix

- Root cause: in `sred-projects-bar.html`, the inner `<span class="truncate">` sits inside `button.flex.flex-col.items-center`. With `items-center` (= `align-items: center`), the span shrink-wraps to its content width, so `truncate` has nothing to clip against — wide labels overflow the segment.
- Fix: change span class from `truncate px-1 text-center leading-tight` to `block w-full max-w-full truncate px-1 text-center leading-tight`. The `block w-full` forces the span to fill the button's content-box width (which the parent's `min-w-[80px]` and flex-basis define), giving truncate a width to clip against.
- Apply the same fix to both `<span>` lines (project name + value) in `sred-projects-bar.html` and `employee-breakdown-bar.html`.

### 3f — Recalculate Projections wire-up

- Add `isRecalculating = signal(false)` in `dashboard.ts`.
- `onRecalculate()` handler: set true, `setTimeout(() => { set false; toast.show('Projections recalculated') }, 800)`.
- Button shows spinner (small SVG with `animate-spin`) when `isRecalculating()` is true. Disabled while running.
- Uses the `ToastService` from Section 1.

### Files

- New: `src/app/core/components/page-header/page-header.{ts,html}` (used by dashboard + employees pages)
- Modified: `src/app/core/models/client.model.ts` — `claimPeriods: ClaimPeriod[]`, add `id` to ClaimPeriod
- Modified: `src/app/features/dashboard/mock/clients.mock.ts` — multi-period clients
- Modified: `src/app/features/dashboard/mock/time-entries.mock.ts` — multi-year generation
- Modified: `src/app/features/dashboard/dashboard.{ts,html}` — page header row, activeClaimPeriodId, recalculate handler
- Modified: `src/app/features/dashboard/components/client-header/client-header.{ts,html}` — period dropdown
- Modified: `src/app/features/dashboard/components/sred-projects-bar/sred-projects-bar.html` — span class fix
- Modified: `src/app/features/dashboard/components/employee-breakdown-bar/employee-breakdown-bar.html` — same span fix
- Modified: `src/app/shared/directives/tooltip.directive.ts` — drop nowrap

## Cross-cutting concerns

### Routing

- `app.routes.ts` adds a child route `employees` under the tenant layout. Same `TenantGuard` and `AuthGuard` chain as `dashboard`.

### Sidebar active state

- The active item indicator must work for both `/dashboard` and `/employees`. Use `routerLinkActive` (already in use).

### Toast service lifecycle

- Toast service is provided in root. Toast component renders once (mounted in authenticated-layout). The service exposes a signal of active toasts; the component renders them.

### Accessibility

- SOON menu items: `aria-disabled="true"`, role unchanged (still appears in nav order). Screen readers announce "Reports, link, disabled" or similar.
- Search and notification buttons get `aria-label`. Toast container has `role="status"` and `aria-live="polite"`.
- Filter dropdowns are native-styled `<button>` + custom popup — keyboard-navigable.

### Testing

- No new calculation modules → no new TDD specs.
- Existing 52 Vitest tests must keep passing.
- Manual browser verification per the verification section below.

## Out of scope

- No new dependencies (no CDK overlay, no Material).
- No real backend wiring for search or notifications.
- No CRUD on employees.
- `Recalculate Projections` is cosmetic — no actual recomputation happens.
- The chevron icon on the sidebar collapse toggle moves into the sidebar itself (not the top bar) — implementation detail decided during planning.

## Verification (manual, in browser)

1. **Chrome:** Logo lives at top of sidebar; tenant selector in top bar; search and bell icons render and on click show a toast; avatar dropdown still works.
2. **Sidebar menus:** Dashboard, Employees, Reports (SOON), Audits (SOON), Settings (SOON), Help (mailto link) all visible. Clicking Reports/Audits/Settings does nothing visible (no navigation) and tooltip shows on hover.
3. **Employees page:** Navigate via sidebar. Title shows "Employees", subtitle "7 of 7 employees" (or current count). Typing in search filters by name. Team / Role / Status dropdowns filter rows. Clicking column headers sorts asc/desc with arrow indicator. Clicking a row opens the employee modal.
4. **Claim period dropdown:** Client header shows current period (e.g., "Jan 1, 2026 – Dec 31, 2026"). Clicking opens dropdown with 2024, 2025, 2026. Selecting 2024 updates everything (timeline tabs, KPI, projects bar, staff section).
5. **Mode tabs / Recalculate placement:** Mode tabs and Recalculate appear in a page header row above all cards, not inside a card.
6. **Multi-year data:** With 2026 selected, YTD tab shows real data through May 19. Q1 has data, Q2 has partial data, Q3/Q4 show 0. With 2024 selected, all four quarters have full data.
7. **Tooltip:** Hover a project segment with a long name — full text wraps to multiple lines if needed; short tooltips stay on one line.
8. **Projects bar truncate:** With small segments (after switching to a wide screen layout), long project names truncate with `…` instead of overflowing.
9. **Recalculate:** Click button → spinner appears for 800ms → toast "Projections recalculated" appears bottom-right.
10. **Build + tests:** `ng build` passes, `npx vitest run` shows 52+ tests passing.
