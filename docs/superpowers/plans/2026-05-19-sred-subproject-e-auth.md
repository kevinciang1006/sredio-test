# Sub-project E: Multi-Tenant Auth + Admin User — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace employee-based single-tenant auth with URL-based multi-tenant routing and an AdminUser (Xavier), so each tenant company has its own URL and the nav bar has a tenant switcher.

**Architecture:** Active tenant lives in the URL (`/tenant/:tenantId/dashboard`). A `TenantGuard` validates the UUID against a `TENANTS` const. `AuthService` stores `AdminUser` instead of `Employee`. The profile page shows an admin card.

**Tech Stack:** Angular 21, signals, `toSignal`, `ActivatedRoute`, `Router.events`, Vitest, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-05-19-sred-subproject-e-auth.md`

---

### Task 1: Tenant const, AdminUser model + mock, app-constants update

**Files:**
- Create: `src/app/core/constants/tenants.const.ts`
- Create: `src/app/core/models/admin-user.model.ts`
- Create: `src/app/core/mock/admin-user.mock.ts`
- Modify: `src/app/core/constants/app-constants.ts`
- Create: `src/app/core/guards/tenant.guard.spec.ts` (TDD for `isValidTenant`)

- [ ] **Step 1: Write the failing test for `isValidTenant`**

Create `src/app/core/guards/tenant.guard.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { isValidTenant } from './tenant.guard';

describe('isValidTenant', () => {
  it('returns true for a known tenant UUID', () => {
    expect(isValidTenant('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
  });

  it('returns true for each of the 4 tenants', () => {
    const ids = [
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'a3bb189e-8bf9-3888-9912-ace4e6543002',
      'b9e4a3cc-1234-4c5d-8901-fde234567890',
      'c7d8e9f0-abcd-4ef0-1234-567890abcdef',
    ];
    ids.forEach(id => expect(isValidTenant(id)).toBe(true));
  });

  it('returns false for an unknown UUID', () => {
    expect(isValidTenant('00000000-0000-0000-0000-000000000000')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidTenant('')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/app/core/guards/tenant.guard.spec.ts
```

Expected: FAIL — `Cannot find module './tenant.guard'`

- [ ] **Step 3: Create `tenants.const.ts`**

```typescript
export interface TenantEntry {
  readonly id: string;
  readonly name: string;
  readonly adminId: string;
  readonly province: string;
}

export const TENANTS: readonly TenantEntry[] = [
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Northwind Labs',   adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'ON' },
  { id: 'a3bb189e-8bf9-3888-9912-ace4e6543002', name: 'Maple Robotics',   adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'BC' },
  { id: 'b9e4a3cc-1234-4c5d-8901-fde234567890', name: 'Quantum Dynamics', adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'AB' },
  { id: 'c7d8e9f0-abcd-4ef0-1234-567890abcdef', name: 'Cedar AI Labs',    adminId: '550e8400-e29b-41d4-a716-446655440000', province: 'QC' },
];
```

- [ ] **Step 4: Create `admin-user.model.ts`**

```typescript
export interface AdminUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin';
}
```

- [ ] **Step 5: Create `admin-user.mock.ts`**

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

- [ ] **Step 6: Create `tenant.guard.ts` with `isValidTenant`**

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

- [ ] **Step 7: Run test to verify it passes**

```bash
npx vitest run src/app/core/guards/tenant.guard.spec.ts
```

Expected: PASS — 4 tests passing

- [ ] **Step 8: Update `app-constants.ts`**

Replace the file contents with:

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

- [ ] **Step 9: Run full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: All previously passing tests still pass.

- [ ] **Step 10: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 11: Commit**

```bash
git add src/app/core/constants/tenants.const.ts \
        src/app/core/models/admin-user.model.ts \
        src/app/core/mock/admin-user.mock.ts \
        src/app/core/guards/tenant.guard.ts \
        src/app/core/guards/tenant.guard.spec.ts \
        src/app/core/constants/app-constants.ts
git commit -m "feat: add TenantEntry const, AdminUser model/mock, TenantGuard, LAST_TENANT_ID constant"
```

---

### Task 2: App routes — tenant URL structure

**Files:**
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Replace `app.routes.ts`**

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

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/app/app.routes.ts
git commit -m "feat: add URL-based tenant routing /tenant/:tenantId/*"
```

---

### Task 3: AuthService — swap Employee → AdminUser

**Files:**
- Modify: `src/app/core/api/auth.service.ts`

- [ ] **Step 1: Rewrite `auth.service.ts`**

Replace the entire file:

```typescript
import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AdminUser } from '../models/admin-user.model';
import { MOCK_ADMIN_USER } from '../mock/admin-user.mock';
import { Credentials } from '../../features/login/models/credentials.model';
import { APP_CONSTANTS } from '../constants/app-constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _currentUser = signal<AdminUser | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(credentials: Credentials): Observable<void> {
    if (!credentials.email || credentials.password.length < 4) {
      return throwError(() => new Error('Invalid email or password.'));
    }
    const fakeToken = `mock-token-${Date.now()}`;
    return of(void 0).pipe(
      delay(300),
      tap(() => this.persist(fakeToken, MOCK_ADMIN_USER)),
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER);
  }

  private persist(token: string, user: AdminUser): void {
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }

  private readUser(): AdminUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors. If `nav-bar.ts` or other consumers access `Employee`-specific fields (like `hireDate`, `annualSalary`), those will error — fix them in the appropriate later tasks, or note them as compile errors to resolve in Task 7 (nav-bar) and Task 8 (profile).

- [ ] **Step 3: Commit**

```bash
git add src/app/core/api/auth.service.ts
git commit -m "feat: auth service stores AdminUser (Xavier) instead of Employee"
```

---

### Task 4: Login — tenant-aware redirect after login

**Files:**
- Modify: `src/app/features/login/login.ts`

- [ ] **Step 1: Update `login.ts` submit handler**

Change the import block to add:
```typescript
import { TENANTS } from '../../core/constants/tenants.const';
import { APP_CONSTANTS } from '../../core/constants/app-constants';
```

Replace the `next` callback in `submit()`:

```typescript
next: () => {
  const lastId = localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID);
  const tenantId = (lastId && TENANTS.some(t => t.id === lastId)) ? lastId : TENANTS[0].id;
  void this.router.navigate(['/tenant', tenantId, 'dashboard']);
},
```

Full updated `login.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/api/auth.service';
import { TENANTS } from '../../core/constants/tenants.const';
import { APP_CONSTANTS } from '../../core/constants/app-constants';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const lastId = localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID);
        const tenantId = (lastId && TENANTS.some(t => t.id === lastId)) ? lastId : TENANTS[0].id;
        void this.router.navigate(['/tenant', tenantId, 'dashboard']);
      },
      error: (err: { message?: string }) => {
        this.errorMessage.set(err.message ?? 'Login failed.');
        this.isSubmitting.set(false);
      },
    });
  }
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/app/features/login/login.ts
git commit -m "feat: login redirects to last-used tenant or first tenant after authentication"
```

---

### Task 5: ClientsService multi-tenant + 4 mock clients

**Files:**
- Modify: `src/app/features/dashboard/services/clients.service.ts`
- Modify: `src/app/features/dashboard/mock/clients.mock.ts`

- [ ] **Step 1: Update `clients.mock.ts`**

Replace the entire file:

```typescript
import { Client } from '../../../core/models/client.model';
import { TENANTS } from '../../../core/constants/tenants.const';

const SHARED_CLAIM_PERIOD = { startDate: '2025-01-01', endDate: '2025-12-31' };

export const MOCK_CLIENTS: Record<string, Client> = {
  [TENANTS[0].id]: {
    id: 'client-001',
    name: 'Northwind Labs',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'ON',
    timeZone: 'EST',
    sredCreditRate: 0.45,
  },
  [TENANTS[1].id]: {
    id: 'client-002',
    name: 'Maple Robotics',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'BC',
    timeZone: 'PST',
    sredCreditRate: 0.40,
  },
  [TENANTS[2].id]: {
    id: 'client-003',
    name: 'Quantum Dynamics',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'AB',
    timeZone: 'MST',
    sredCreditRate: 0.35,
  },
  [TENANTS[3].id]: {
    id: 'client-004',
    name: 'Cedar AI Labs',
    claimPeriod: SHARED_CLAIM_PERIOD,
    province: 'QC',
    timeZone: 'EST',
    sredCreditRate: 0.30,
  },
};

export const MOCK_CLIENT: Client = MOCK_CLIENTS[TENANTS[0].id];
```

- [ ] **Step 2: Update `clients.service.ts`**

Replace the entire file:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client } from '../../../core/models/client.model';
import { MOCK_CLIENTS } from '../mock/clients.mock';
import { TENANTS } from '../../../core/constants/tenants.const';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  getCurrent(tenantId: string): Observable<Client> {
    if (environment.useMocks) {
      return of(MOCK_CLIENTS[tenantId] ?? MOCK_CLIENTS[TENANTS[0].id]).pipe(delay(200));
    }
    return this.http.get<Client>(`${environment.apiBaseUrl}/clients/${tenantId}`);
  }
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: TypeScript will now error on `dashboard.ts` where `getCurrent()` is called without arguments — that is expected and will be fixed in Task 6.

- [ ] **Step 4: Run test suite**

```bash
npx vitest run
```

Expected: All tests pass (no test references `ClientsService` directly).

- [ ] **Step 5: Commit**

```bash
git add src/app/features/dashboard/services/clients.service.ts \
        src/app/features/dashboard/mock/clients.mock.ts
git commit -m "feat: ClientsService accepts tenantId, mock provides 4 tenant clients"
```

---

### Task 6: Dashboard — read tenantId from route

**Files:**
- Modify: `src/app/features/dashboard/dashboard.ts`

- [ ] **Step 1: Add `ActivatedRoute` injection and wire `tenantId` into `getCurrent()`**

In `dashboard.ts`, add to the import block:
```typescript
import { ActivatedRoute } from '@angular/router';
```

In the `DashboardComponent` class body, add after the service injections:
```typescript
private readonly route = inject(ActivatedRoute);
private readonly tenantId = this.route.snapshot.params['tenantId'] as string;
```

Change the client signal (currently line 75):
```typescript
// Before:
readonly client = toSignal<Client | null, Client | null>(this.clientsSvc.getCurrent(), {
  initialValue: null,
});

// After:
readonly client = toSignal<Client | null, Client | null>(this.clientsSvc.getCurrent(this.tenantId), {
  initialValue: null,
});
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Run test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/dashboard/dashboard.ts
git commit -m "feat: dashboard reads tenantId from route and passes to ClientsService"
```

---

### Task 7: Nav bar — tenant switcher + tenant-aware links

**Files:**
- Modify: `src/app/core/components/nav-bar/nav-bar.ts`
- Modify: `src/app/core/components/nav-bar/nav-bar.html`

- [ ] **Step 1: Rewrite `nav-bar.ts`**

Replace the entire file:

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../api/auth.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { TENANTS } from '../../constants/tenants.const';
import { APP_CONSTANTS } from '../../constants/app-constants';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, AvatarComponent],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class NavBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  readonly currentUser = this.auth.currentUser;
  readonly isOpen = signal(false);
  readonly isTenantOpen = signal(false);
  readonly tenants = TENANTS;

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

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
    this.isTenantOpen.set(false);
  }

  toggleTenantDropdown(): void {
    this.isTenantOpen.update(v => !v);
    this.isOpen.set(false);
  }

  switchTenant(tenantId: string): void {
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID, tenantId);
    void this.router.navigate(['/tenant', tenantId, 'dashboard']);
    this.isTenantOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.isTenantOpen.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    this.isOpen.set(false);
    void this.router.navigate(['/login']);
  }
}
```

- [ ] **Step 2: Rewrite `nav-bar.html`**

Replace the entire file:

```html
<header class="bg-white border-b border-gray-200 fixed left-0 right-0 top-0 z-50 h-14 flex items-center px-4 gap-3">
  <button
    type="button"
    (click)="sidebarToggle.emit()"
    class="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:outline-none shrink-0">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
    <span class="sr-only">Toggle sidebar</span>
  </button>

  <span class="flex items-center gap-2 text-xl font-semibold text-blue-600 shrink-0">
    <span class="inline-flex w-8 h-8 rounded bg-blue-600 text-white items-center justify-center text-sm font-bold">S</span>
    sred.io
  </span>

  <div class="relative shrink-0">
    <button
      type="button"
      (click)="toggleTenantDropdown()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none text-sm font-medium text-gray-700">
      {{ currentTenant()?.name ?? 'Select tenant' }}
      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    @if (isTenantOpen()) {
      <div class="absolute left-0 mt-2 w-52 rounded-lg shadow-lg bg-white border border-gray-200 z-50 py-1">
        @for (t of tenants; track t.id) {
          <button
            type="button"
            (click)="switchTenant(t.id)"
            class="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <span>{{ t.name }}</span>
            @if (t.id === currentTenantId()) {
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          </button>
        }
      </div>
    }
  </div>

  <div class="flex-1"></div>

  <div class="relative shrink-0">
    <button
      type="button"
      (click)="toggleDropdown()"
      class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 focus:outline-none">
      @if (currentUser(); as u) {
        <app-avatar [name]="u.name" size="sm" />
        <div class="min-w-0 text-left">
          <p class="text-sm font-medium text-gray-900 truncate max-w-40">{{ u.name }}</p>
          <p class="text-xs text-gray-500 truncate max-w-40">{{ u.email }}</p>
        </div>
        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      }
    </button>

    @if (isOpen()) {
      <div class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
        <a
          [routerLink]="['/tenant', currentTenantId(), 'profile']"
          (click)="isOpen.set(false)"
          class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </a>
        <hr class="border-gray-100" />
        <button
          type="button"
          (click)="logout()"
          class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    }
  </div>
</header>
```

Note: `sidebarToggle` output is still used — keep it. The logo is now a `<span>` (not a link) since tenants navigate via the switcher.

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 4: Commit**

```bash
git add src/app/core/components/nav-bar/nav-bar.ts \
        src/app/core/components/nav-bar/nav-bar.html
git commit -m "feat: nav bar tenant switcher dropdown with URL-based tenant navigation"
```

---

### Task 8: Profile page — admin card

**Files:**
- Modify: `src/app/features/profile/profile.ts`
- Modify: `src/app/features/profile/profile.html`

Do NOT modify or delete: `profile-card.ts`, `profile-contributions.ts`, `profile.service.ts`, `profile.model.ts`.

- [ ] **Step 1: Rewrite `profile.ts`**

Replace the entire file:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/api/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { BadgeComponent } from '../../shared/components/badge/badge';
import { TENANTS } from '../../core/constants/tenants.const';

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

- [ ] **Step 2: Rewrite `profile.html`**

Replace the entire file:

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

- [ ] **Step 3: Check and remove the `styleUrl` from `profile.ts` if `profile.scss` is empty or style-free**

Check whether `profile.scss` has any content. If the file is empty, remove the `styleUrl: './profile.scss'` line from the component decorator to keep it clean. If it has content, leave it.

- [ ] **Step 4: Type check**

```bash
npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (42+ tests, no regressions).

- [ ] **Step 6: Commit**

```bash
git add src/app/features/profile/profile.ts \
        src/app/features/profile/profile.html
git commit -m "feat: profile page shows admin card for Xavier (name, email, role, tenant count)"
```

---

## Final Verification

After all 8 tasks are complete:

```bash
npx tsc --noEmit   # zero errors
npx vitest run     # all tests pass (42+ including 4 new isValidTenant tests)
```

Manual checks:
1. `/` → redirects to `/tenant/f47ac10b-.../dashboard`, header shows "Northwind Labs"
2. Tenant switcher in nav shows "Northwind Labs" with chevron; clicking "Maple Robotics" changes URL + header to "Maple Robotics" and credit rate changes to 40%
3. Clicking "Quantum Dynamics" → URL `/tenant/b9e4a3cc-.../dashboard`, header "Quantum Dynamics"
4. Navigate directly to `/tenant/bad-uuid/dashboard` → redirected to `/login`
5. Login → lands on last-used tenant (or Northwind Labs on first use)
6. Profile page shows: Xavier Beaumont, Admin badge, xavier@sredio.io, "4 Tenants Managed"
7. User dropdown "My Profile" navigates to `/tenant/:currentId/profile`
