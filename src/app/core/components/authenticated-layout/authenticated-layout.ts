import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs/operators';
import { NavBarComponent } from '../nav-bar/nav-bar';
import { SideBarComponent } from '../side-bar/side-bar';

@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, NavBarComponent, SideBarComponent],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent {
  private readonly route = inject(ActivatedRoute);

  readonly sidebarCollapsed = signal(false);
  readonly tenantId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('tenantId') ?? '')),
    { initialValue: this.route.snapshot.params['tenantId'] as string ?? '' },
  );

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
