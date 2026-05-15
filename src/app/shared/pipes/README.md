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
