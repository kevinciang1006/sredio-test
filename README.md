# sredio — SR&ED Financial Dashboard

A production-shaped Angular 21 dashboard for visualising timesheet and salary data and projecting SR&ED-eligible monetary credits for the remainder of the year.

**Live demo:** https://kevinciang1006.github.io/sredio-test/

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

- **Why ApexCharts over ngx-charts and Chart.js?** ngx-charts maintenance health is poor (729 open issues / 159 stale PRs as of May 2026). ApexCharts is actively maintained, SVG-based (suits PDF export to CRA), and visually polished. The minor tradeoff of imperative options-object configuration is acceptable; signal-driven re-renders work natively because `[series]` and `[xaxis]` bind to signal-derived computed values.
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

The live demo: https://kevinciang1006.github.io/sredio-test/

## License

Take-home submission, May 2026. Not for redistribution.
