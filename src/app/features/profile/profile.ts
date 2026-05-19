import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/api/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { BadgeComponent } from '../../shared/components/badge/badge';
import { TENANTS } from '../../core/constants/tenants.const';

@Component({
  selector: 'app-profile',
  imports: [AvatarComponent, BadgeComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly adminUser = this.auth.currentUser;
  readonly tenantCount = TENANTS.length;
}
