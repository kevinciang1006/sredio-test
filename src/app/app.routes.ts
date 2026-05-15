import { Routes } from '@angular/router';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout';
import { GuestLayoutComponent } from './core/components/guest-layout/guest-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard],
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
  { path: '**', redirectTo: 'dashboard' },
];
