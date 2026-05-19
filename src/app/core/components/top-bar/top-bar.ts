import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  readonly isOpen = signal(false);
  readonly isTenantOpen = signal(false);

  readonly currentTenantId = computed(() => {
    const url = this.router.url;
    const m = url.match(/\/tenant\/([^/]+)/);
    return m ? m[1] : '';
  });

  readonly currentTenant = computed(() => {
    const id = this.currentTenantId();
    return this.tenants.find(t => t.id === id);
  });

  toggleDropdown(): void { this.isOpen.update(v => !v); }
  toggleTenantDropdown(): void { this.isTenantOpen.update(v => !v); }

  switchTenant(id: string): void {
    this.isTenantOpen.set(false);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.LAST_TENANT_ID, id);
    void this.router.navigate(['/tenant', id, 'dashboard']);
  }

  logout(): void {
    this.isOpen.set(false);
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  onComingSoon(feature: string): void {
    this.toastSvc.show(`${feature} coming soon`);
  }
}
