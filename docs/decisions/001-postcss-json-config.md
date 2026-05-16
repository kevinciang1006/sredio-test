# ADR 001: Use postcss.config.json instead of postcss.config.mjs

**Status:** Accepted
**Date:** 2026-05-16

## Context

Angular's `@angular/build:application` builder (Vite/esbuild) resolves PostCSS config
at build time. It hardcodes a lookup for `postcss.config.json` or `.postcssrc.json` only.
ES-module `.mjs` files are silently ignored — `@tailwindcss/postcss` never ran.

Source: `node_modules/@angular/build/src/utils/postcss-configuration.js`

## Decision

`postcss.config.json` is the authoritative config:
```json
{ "plugins": { "@tailwindcss/postcss": {}, "autoprefixer": {} } }
```

`postcss.config.mjs` remains for reference but must not be treated as active.
Any new PostCSS plugins must be added to the `.json` file.

## Consequences

- Tailwind v4 utility classes are generated correctly during `ng build` and `ng serve`.
- Engineers adding PostCSS plugins update `postcss.config.json`, not the `.mjs` file.
