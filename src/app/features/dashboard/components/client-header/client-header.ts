import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-header',
  imports: [],
  templateUrl: './client-header.html',
  styleUrl: './client-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderComponent {
  readonly client = input<Client | null>(null);
  readonly isLoading = input(false);
}
