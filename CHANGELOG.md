# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- SR&ED Financial Dashboard: full Angular 21 implementation with ApexCharts, mock data for 7 employees / 5 projects / 9 months of time entries
- Shared `AvatarComponent` (initials-based, size xs/sm/md/lg)
- Shared `BadgeComponent` (colored pill, variants blue/green/red/yellow/gray/purple)
- Shared `ShortDatePipe` (formats ISO dates as "1 Jan 2025")
- `SideBarComponent` with Dashboard and Profile navigation
- GitHub Pages SPA workaround: `public/404.html` redirect script
- Profile page contribution section: per-project hours chart + breakdown table

### Changed
- Navbar redesigned: removed nav links; added user avatar dropdown (My Profile, Sign out)
- Layout switched from stacked to sidebar + main flex-row
- Employee grid: avatar in name column, role badge, formatted hire dates
- Routing: removed `withHashLocation()` — clean HTML5 history URLs

### Fixed
- PostCSS config was `.mjs` (ES module); Angular's `@angular/build` only reads `postcss.config.json` — created JSON config so Tailwind v4 now runs
- Tests: removed stale `ng new` scaffold spec that checked for `<h1>Hello, sredio-temp</h1>`
- Dates in employee grid were raw ISO strings (`2022-04-11`) instead of human-readable format
