import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileService } from './services/profile.service';
import { ProfileCardComponent } from './components/profile-card/profile-card';
import { Profile } from './models/profile.model';

@Component({
  selector: 'app-profile',
  imports: [ProfileCardComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly profileSvc = inject(ProfileService);
  readonly profile = toSignal<Profile | null, Profile | null>(
    this.profileSvc.getCurrent(),
    { initialValue: null },
  );
  readonly isLoading = computed(() => this.profile() === null);
}
