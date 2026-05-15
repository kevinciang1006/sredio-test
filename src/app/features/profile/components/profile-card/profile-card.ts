import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Profile } from '../../models/profile.model';
import { hourlyRate } from '../../../dashboard/calculations';

@Component({
  selector: 'app-profile-card',
  imports: [CurrencyPipe],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
  readonly profile = input<Profile | null>(null);
  readonly isLoading = input(false);

  readonly hourly = computed(() => {
    const p = this.profile();
    return p ? hourlyRate(p) : 0;
  });
}
