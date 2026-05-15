# Guards

Route guards live here. They run before navigation completes and decide whether the route can be activated.

## Convention
- One guard per file, named `<purpose>.guard.ts` (kebab-case).
- Use the functional API (`CanActivateFn`, `CanMatchFn`) — not the deprecated class-based one.
- Register in `app.routes.ts` via `canActivate: [authGuard]`.

## What's implemented here
- `auth.guard.ts` — redirects unauthenticated users to `/login`.

## What would live here later (RBAC, role checks, feature flags)
```ts
// roles.guard.ts (example, not implemented)
export const rolesGuard = (allowed: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return allowed.includes(auth.currentUser()?.role) || router.parseUrl('/forbidden');
};
```
