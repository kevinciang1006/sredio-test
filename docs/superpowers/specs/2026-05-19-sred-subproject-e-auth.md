# Sub-project E: Multi-Tenant Auth + Admin User

## Goal

Replace the single-tenant, employee-auth setup with URL-based multi-tenant routing. The logged-in user becomes Xavier (AdminUser), who can switch between 4 demo tenant companies via the nav bar. Each tenant has its own URL (`/tenant/:tenantId/dashboard`). The profile page shows an admin card instead of an employee card.

## Architecture

Active tenant is always derived from the URL param `:tenantId` — never stored in a service signal. A `TenantGuard` validates the UUID on every protected route entry. Switching tenants navigates the user to a new URL and persists the choice in localStorage.

---

## 1. Tenant Data Structure

**`src/app/core/constants/tenants.const.ts`** — single source of truth for all demo tenants:

```typescript
export interface TenantEntry {
  readonly id: string;       // UUID v4
  readonly name: string;
  readonly adminId: string;  // matches AdminUser.id
  readonly province: string;
}

export const TENANTS: readonly TenantEntry[] = [
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Northwind Labs',   adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'ON' },
  { id: 'a3bb189e-8bf9-3888-9912-ace4e6543002', name: 'Maple Robotics',   adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'BC' },
  { id: 'b9e4a3cc-1234-4c5d-8901-fde234567890', name: 'Quantum Dynamics', adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'AB' },
  { id: 'c7d8e9f0-abcd-4ef0-1234-567890abcdef', name: 'Cedar AI Labs',    adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'QC' },
];
```

---

## 2. AdminUser Model + Mock

**`src/app/core/models/admin-user.model.ts`** — separate from `Employee`, never appears in employee lists:

```typescript
export interface AdminUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin';
}
```

**`src/app/core/mock/admin-user.mock.ts`**:

```typescript
import { AdminUser } from '../models/admin-user.model';
import { TENANTS } from '../constants/tenants.const';

export const MOCK_ADMIN_USER: AdminUser = {
  id: TENANTS[0].adminId,
  name: 'Xavier Beaumont',
  email: 'xavier@sredio.io',
  role: 'admin',
};
```

---

## 3. Route Structure

```
/                                   → redirect to /tenant/TENANTS[0].id/dashboard
/login                              (GuestLayout, unchanged)
/tenant/:tenantId                   → redirect to /tenant/:tenantId/dashboard
/tenant/:tenantId/dashboard         (AuthenticatedLayout + authGuard + tenantGuard)
/tenant/:tenantId/profile           (AuthenticatedLayout + authGuard + tenantGuard)
/**                                 → redirect to /tenant/TENANTS[0].id/dashboard
```

**`src/app/app.routes.ts`** — full replacement:

```typescript
import { Routes } from '@angular/router';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout';
import { GuestLayoutComponent } from './core/components/guest-layout/guest-layout';
import { authGuard } from './core/guards/auth.guard';
import { tenantGuard } from './core/guards/tenant.guard';
import { TENANTS } from './core/constants/tenants.const';

export const routes: Routes = [
  { path: '', redirectTo: `tenant/${TENANTS[0].id}/dashboard`, pathMatch: 'full' },
  {
    path: 'tenant/:tenantId',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard, tenantGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then(m => m.ProfileComponent),
      },
    ],
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/login/login').then(m => m.LoginComponent),
      },
    ],
  },
  { path: '**', redirectTo: `tenant/${TENANTS[0].id}/dashboard` },
];
```

---

## 4. TenantGuard

**`src/app/core/guards/tenant.guard.ts`** — functional `CanActivateFn`:

```typescript
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { TENANTS } from '../constants/tenants.const';

export const isValidTenant = (tenantId: string): boolean =>
  TENANTS.some(t => t.id === tenantId);

export const tenantGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const tenantId = route.params['tenantId'] as string;
  return isValidTenant(tenantId) ? true : inject(Router).parseUrl('/login');
};
```

`isValidTenant` is a pure function — tested in `tenant.guard.spec.ts`.

---

## 5. App Constants

**`src/app/core/constants/app-constants.ts`** — add `LAST_TENANT_ID`, update `ROUTES`:

```typescript
export const APP_CONSTANTS = {
  CURRENT_DATE: '2025-09-30',
  HOURS_PER_YEAR: 2000,
  LOCAL_STORAGE_KEYS: {
    AUTH_TOKEN: 'sredio.auth.token',
    AUTH_USER: 'sredio.auth.user',
    LAST_TENANT_ID: 'sredio.last-tenant-id',
  },
} as const;

export const ROUTES = {
  LOGIN: 'login',
  TENANT_ROOT: 'tenant',
} as const;
```

---

## 6. Auth Service Changes

**`src/app/core/api/auth.service.ts`** — swap `Employee` → `AdminUser`:

- `_currentUser` signal type: `AdminUser | null`
- `login()`: stores `MOCK_ADMIN_USER` (no more hardcoded Aria Chen employee)
- `readUser()`: parses stored JSON as `AdminUser`
- Remove `Employee` import; add `AdminUser` and `MOCK_ADMIN_USER` imports

---

## 7. Login Component Changes

**`src/app/features/login/login.ts`** — tenant-aware post-login redirect:

After login success, read `localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID)`.
If it's a valid UUID in `TENANTS`, navigate there; else navigate to `TENANTS[0].id`.

```typescript
next: () => {
  const lastId = localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID);
  const tenantId = (lastId && TENANTS.some(t => t.id === lastId)) ? lastId : TENANTS[0].id;
  void this.router.navigate(['/tenant', tenantId, 'dashboard']);
},
```

---

## 8. Nav Bar — Tenant Switcher

**`src/app/core/components/nav-bar/nav-bar.ts`** additions:

- `isTenantOpen = signal(false)` — separate from `isOpen` (user dropdown)
- Read current URL reactively:
  ```typescript
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly currentTenantId = computed(() => this.currentUrl().match(/\/tenant\/([^/]+)/)?.[1] ?? null);
  readonly currentTenant = computed(() => TENANTS.find(t => t.id === this.currentTenantId()) ?? null);
  readonly tenants = TENANTS;
  ```
- `switchTenant(id: string)`: saves `id` to localStorage key `LAST_TENANT_ID`, navigates to `/tenant/${id}/dashboard`, closes dropdown
- `onDocumentClick` already closes `isOpen`; also close `isTenantOpen`

**`src/app/core/components/nav-bar/nav-bar.html`** layout changes:

```
[hamburger] [sred.io logo] [tenant-switcher-dropdown] [spacer flex-1] [user-dropdown]
```

- Logo loses `flex-1`
- Tenant switcher: button showing `currentTenant()?.name ?? 'Select tenant'` + chevron; dropdown lists all `tenants` with click `switchTenant(t.id)`
- `routerLink="/dashboard"` on logo → remove (logo is not a nav link)
- "My Profile" link in user dropdown: `[routerLink]="['/tenant', currentTenantId(), 'profile']"`

---

## 9. ClientsService Changes

**`src/app/features/dashboard/services/clients.service.ts`** — add `tenantId` param:

```typescript
getCurrent(tenantId: string): Observable<Client> {
  if (environment.useMocks) {
    return of(MOCK_CLIENTS[tenantId] ?? MOCK_CLIENTS[TENANTS[0].id]).pipe(delay(200));
  }
  return this.http.get<Client>(`${environment.apiBaseUrl}/clients/${tenantId}`);
}
```

**`src/app/features/dashboard/mock/clients.mock.ts`** — 4 mock clients:

```typescript
import { Client } from '../../../core/models/client.model';
import { TENANTS } from '../../../core/constants/tenants.const';

const SHARED_CLAIM_PERIOD = { startDate: '2025-01-01', endDate: '2025-12-31' };

export const MOCK_CLIENTS: Record<string, Client> = {
  [TENANTS[0].id]: { id: 'client-001', name: 'Northwind Labs',   claimPeriod: SHARED_CLAIM_PERIOD, province: 'ON', timeZone: 'EST', sredCreditRate: 0.45 },
  [TENANTS[1].id]: { id: 'client-002', name: 'Maple Robotics',   claimPeriod: SHARED_CLAIM_PERIOD, province: 'BC', timeZone: 'PST', sredCreditRate: 0.40 },
  [TENANTS[2].id]: { id: 'client-003', name: 'Quantum Dynamics', claimPeriod: SHARED_CLAIM_PERIOD, province: 'AB', timeZone: 'MST', sredCreditRate: 0.35 },
  [TENANTS[3].id]: { id: 'client-004', name: 'Cedar AI Labs',    claimPeriod: SHARED_CLAIM_PERIOD, province: 'QC', timeZone: 'EST', sredCreditRate: 0.30 },
};

export const MOCK_CLIENT: Client = MOCK_CLIENTS[TENANTS[0].id];
```

---

## 10. Dashboard Changes

**`src/app/features/dashboard/dashboard.ts`**:

- Add `inject(ActivatedRoute)` (from `@angular/router`)
- Read `tenantId`:
  ```typescript
  private readonly route = inject(ActivatedRoute);
  private readonly tenantId = this.route.snapshot.params['tenantId'] as string;
  ```
- Change client loading: `this.clientsSvc.getCurrent(this.tenantId)`

---

## 11. Profile Page Changes

**`src/app/features/profile/profile.ts`** — rewrite to use AdminUser:

```typescript
@Component({
  selector: 'app-profile',
  imports: [AvatarComponent, BadgeComponent],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly adminUser = this.auth.currentUser;
  readonly tenantCount = TENANTS.length;
}
```

**`src/app/features/profile/profile.html`** — admin card:

```html
<div class="max-w-2xl mx-auto">
  <section class="bg-white rounded-lg border border-gray-200 p-6">
    @if (adminUser(); as u) {
      <div class="flex items-start gap-5">
        <app-avatar [name]="u.name" size="lg" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl font-semibold text-gray-900">{{ u.name }}</h1>
            <app-badge label="Admin" variant="blue" />
          </div>
          <p class="text-sm text-gray-500 mt-0.5">{{ u.email }}</p>
        </div>
      </div>
      <dl class="mt-6 grid grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <dt class="text-xs uppercase tracking-wide text-gray-500 font-medium">Tenants Managed</dt>
          <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ tenantCount }}</dd>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <dt class="text-xs uppercase tracking-wide text-gray-500 font-medium">Role</dt>
          <dd class="mt-1 text-2xl font-semibold text-gray-900 capitalize">{{ u.role }}</dd>
        </div>
      </dl>
    }
  </section>
</div>
```

Files left in place but no longer used: `profile-card.ts`, `profile-contributions.ts`, `profile.service.ts`, `profile.model.ts` — do NOT delete.

---

## Verification

1. `npx tsc --noEmit` — zero errors
2. `npx vitest run` — all existing tests pass, + `isValidTenant` tests pass
3. App loads at `/` → URL changes to `/tenant/f47ac10b-.../dashboard`, Northwind Labs shown in header
4. Tenant switcher appears left of the spacer in nav — shows "Northwind Labs"
5. Click "Maple Robotics" in switcher → URL changes to `/tenant/a3bb189e-.../dashboard`, header shows "Maple Robotics"
6. Navigate to `/tenant/not-a-real-uuid/dashboard` → redirected to `/login`
7. Login with any credentials → lands on last-used tenant (or Northwind if first time)
8. Profile page shows Xavier's card: name, Admin badge, email, "4 Tenants Managed"
9. After page reload, stays on last-used tenant
