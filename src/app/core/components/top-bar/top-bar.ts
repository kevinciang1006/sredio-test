import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../api/auth.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { ToastService } from '../../../shared/services/toast.service';
import { TENANTS } from '../../constants/tenants.const';
import { APP_CONSTANTS } from '../../constants/app-constants';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink, AvatarComponent, TooltipDirective],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastSvc = inject(ToastService);

  readonly currentUser = this.auth.currentUser;
  readonly tenants = TENANTS;

  private readonly routerUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly currentTenantId = computed(() => {
    const m = this.routerUrl().match(/\/tenant\/([^/]+)/);
    return m ? m[1] : '';
  });

  readonly currentTenant = computed(() => {
    const id = this.currentTenantId();
    return this.tenants.find(t => t.id === id);
  });

  switchTenant(id: string): void {
    this.closeDropdown('tenant-dropdown');
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID, id);
    void this.router.navigate(['/tenant', id, 'dashboard']);
  }

  logout(): void {
    this.closeDropdown('user-dropdown');
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  // Hide the menu before navigation so Popper doesn't re-position it against
  // the re-rendered trigger (causing a visual jump). Flowbite's internal
  // `_visible` flag goes stale here, but `initFlowbite()` re-runs on the next
  // NavigationEnd and constructs a fresh Dropdown with `_visible = false`,
  // so the state re-syncs on its own.
  // Note: only ONE element per menu may carry `data-dropdown-toggle` —
  // `DefaultInstanceOptions.override = true` means later instances destroy
  // earlier ones' listeners.
  closeDropdown(menuId: string): void {
    document.getElementById(menuId)?.classList.add('hidden');
  }

  onComingSoon(feature: string): void {
    this.toastSvc.show(`${feature} coming soon`);
  }
}
