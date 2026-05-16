import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Profile } from '../../models/profile.model';
import { TimeEntry } from '../../../dashboard/models/time-entry.model';
import { Project } from '../../../dashboard/models/project.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar';
import { BadgeComponent } from '../../../../shared/components/badge/badge';
import { ShortDatePipe } from '../../../../shared/pipes/short-date.pipe';
import { hourlyRate, employeeHoursOnProject, employeeCostOnProject } from '../../../dashboard/calculations';
import { APP_CONSTANTS } from '../../../../core/constants/app-constants';

@Component({
  selector: 'app-profile-card',
  imports: [CurrencyPipe, DecimalPipe, AvatarComponent, BadgeComponent, ShortDatePipe],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
  readonly profile = input<Profile | null>(null);
  readonly timeEntries = input<readonly TimeEntry[]>([]);
  readonly projects = input<readonly Project[]>([]);
  readonly isLoading = input(false);

  private readonly asOf = APP_CONSTANTS.CURRENT_DATE;

  readonly hourly = computed(() => {
    const p = this.profile();
    return p ? hourlyRate(p) : 0;
  });

  readonly ytdHours = computed(() => {
    const p = this.profile();
    if (!p) return 0;
    return this.projects().reduce(
      (sum, proj) => sum + employeeHoursOnProject(p.id, proj.id, this.timeEntries(), this.asOf),
      0,
    );
  });

  readonly ytdCost = computed(() => {
    const p = this.profile();
    if (!p) return 0;
    return this.projects().reduce(
      (sum, proj) => sum + employeeCostOnProject(p, proj.id, this.timeEntries(), this.asOf),
      0,
    );
  });

  readonly activeProjectCount = computed(() => {
    const p = this.profile();
    if (!p) return 0;
    return this.projects().filter(
      proj => employeeHoursOnProject(p.id, proj.id, this.timeEntries(), this.asOf) > 0,
    ).length;
  });
}
