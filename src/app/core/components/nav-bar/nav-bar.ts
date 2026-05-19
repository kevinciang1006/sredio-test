import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  output,
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
  readonly sidebarToggle = output<void>();

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
