import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavBarComponent } from '../nav-bar/nav-bar';
import { ClientsService } from '../../../features/dashboard/services/clients.service';

@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent {
  private readonly clients = inject(ClientsService);
  readonly client = toSignal(this.clients.getCurrent(), { initialValue: null });
}
