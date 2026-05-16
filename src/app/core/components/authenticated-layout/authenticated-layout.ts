import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class AuthenticatedLayoutComponent {}
