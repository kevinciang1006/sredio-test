import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileService } from './services/profile.service';
import { TimeEntriesService } from '../dashboard/services/time-entries.service';
import { ProjectsService } from '../dashboard/services/projects.service';
import { ProfileCardComponent } from './components/profile-card/profile-card';
import { ProfileContributionsComponent } from './components/profile-contributions/profile-contributions';
import { Profile } from './models/profile.model';
import { TimeEntry } from '../dashboard/models/time-entry.model';
import { Project } from '../dashboard/models/project.model';

@Component({
  selector: 'app-profile',
  imports: [ProfileCardComponent, ProfileContributionsComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly profileSvc = inject(ProfileService);
  private readonly timeEntriesSvc = inject(TimeEntriesService);
  private readonly projectsSvc = inject(ProjectsService);

  readonly profile = toSignal<Profile | null, Profile | null>(
    this.profileSvc.getCurrent(), { initialValue: null },
  );
  readonly timeEntries = toSignal<readonly TimeEntry[], readonly TimeEntry[]>(
    this.timeEntriesSvc.getAll(), { initialValue: [] },
  );
  readonly projects = toSignal<readonly Project[], readonly Project[]>(
    this.projectsSvc.getAll(), { initialValue: [] },
  );

  readonly isLoading = computed(
    () => this.profile() === null || this.timeEntries().length === 0,
  );
}
