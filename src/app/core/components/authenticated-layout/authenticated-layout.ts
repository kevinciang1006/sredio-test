import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
    // ApexCharts measures container width on resize events, not CSS transitions.
    // Fire after the 300ms sidebar animation completes so charts reflow to the new width.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 310);
  }
}
