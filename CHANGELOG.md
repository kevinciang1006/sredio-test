# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Mode toggle (Hours / Expenditures / Credits)** — all dashboard sections (quarterly timeline, KPI panel, projects bar, employee breakdown, staff section) respond to the selected mode
- **Staff section mode-awareness** — `StaffBarEntry` model replaced `sredHours`/`unclaimedHours` with mode-agnostic `sredValue`/`unclaimedValue`; `staffBarData()` now accepts `mode` + `creditRate` and applies the same `hourlyRate()` + `sredCredits()` pattern as project calculations; in Credits mode the Unclaimed series is hidden
- **Multi-tenant support** — `/tenant/:id/dashboard` routing; tenant switcher dropdown in top bar; last-used tenant persisted in localStorage; `ClientsService` accepts `tenantId`; 4 separate mock clients
- **Employees page** — searchable, filterable (by team, role), and fully sortable employee table with hire date, end date, hourly rate, role badge, and avatar
- `filterAndSortEmployees()` pure function with Vitest spec
- **SR&ED Projects bar** with drill-down to per-employee breakdown bar; breadcrumb navigation between drill levels
- **Staff Section** — employees grouped by team, bar chart per group (SR&ED vs Unclaimed), clicking an employee opens the modal
- **Employee modal** — per-employee SR&ED project breakdown, mode toggle (Hours/Expenditures/Credits), SR&ED allocation %, hire date, period date range
- **Claim period selector** — multi-year (2024 / 2025 / 2026), displayed in page header with status badge ("Completed" / "In Progress") and last-updated tooltip
- **Quarterly Timeline tabs** (Q1 / Q2 / Q3 / Q4 / Year to Date) — mode-switchable values, active period highlighted
- **Dual KPI panel** — current period value (large) + projected full-year value (right); both mode-aware
- `PageHeaderComponent` — title, subtitle, `ng-content` slot for action controls (e.g. Recalculate Projections)
- `TopBarComponent` — sticky header with tenant dropdown, notification/search placeholders, user avatar dropdown
- `ToastService` + `ToastComponent` — bottom-right ephemeral notifications
- `InfoTooltipComponent` — reusable `?` icon with hover tooltip, used across dashboard sections
- `TooltipDirective` — attribute directive for arbitrary element tooltips
- Skeleton loading state during tenant switch (cards shimmer while data resolves)
- `app-page-header` with "Recalculate Projections" button wired to a simulated 800 ms async recalculation
- SR&ED Financial Dashboard: initial Angular 21 implementation with ApexCharts, mock data for 7 employees / 5 projects
- Shared `AvatarComponent` (initials-based, size xs/sm/md/lg)
- Shared `BadgeComponent` (colored pill, variants blue/green/red/yellow/gray/purple)
- Shared `ShortDatePipe` (formats ISO dates as "1 Jan 2025")
- `SideBarComponent` with collapsible state, logo, Dashboard and Profile navigation, Help footer
- GitHub Pages SPA workaround: `public/404.html` redirect script
- Profile page: admin card (name, email, role, tenant count) + per-project contribution chart + breakdown table

### Changed
- `Client.claimPeriod` (single) → `claimPeriods[]` (array) supporting multi-year periods
- `EmployeeModalComponent` promoted from `features/dashboard` to `shared/components`
- Layout: stacked navbar → collapsible sidebar + sticky top bar (`AuthenticatedLayoutComponent`)
- Sidebar: redesigned with logo, updated menu items, Help footer link
- Mock time entries extended through 2026-05-19 covering 3 claim years (2024 / 2025 / 2026)
- `CURRENT_DATE` updated to `'2026-05-19'`
- `asOf` in `DashboardComponent` changed from a plain string constant to a `computed()` signal — returns `min(CURRENT_DATE, activeClaimPeriod.endDate)` so past periods use their own end date rather than today (prevents 2026 entries bleeding into the 2025 view)
- Routing: removed `withHashLocation()` — clean HTML5 history URLs with GitHub Pages 404 workaround

### Fixed
- **Tenant dropdown stuck on first option** — `currentTenantId` computed in `TopBarComponent` now derives the URL reactively via `toSignal(router.events.pipe(filter(NavigationEnd)))` instead of reading the non-reactive `router.url` string property
- **Dashboard data not loading on direct navigation** — `tenantId` in `DashboardComponent` now reads from `route.parent!.paramMap` (the tenant segment lives on the parent route, not the child)
- **Past periods pulling in future entries** — `asOf` is now a computed signal capped to the active claim period's end date; viewing 2025 no longer includes entries from 2026
- PostCSS config was `.mjs` (ES module); Angular's `@angular/build` only reads `postcss.config.json` — created JSON config so Tailwind v4 now runs
- Tests: removed stale `ng new` scaffold spec that checked for `<h1>Hello, sredio-temp</h1>`
- Dates in employee grid were raw ISO strings (`2022-04-11`) instead of human-readable format
- Tooltip multiline rendering + projects/employee bar segment text truncation
- Sidebar scrollbar visible when collapsed; icon misalignment at narrow widths
