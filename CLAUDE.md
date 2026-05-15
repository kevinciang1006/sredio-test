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
