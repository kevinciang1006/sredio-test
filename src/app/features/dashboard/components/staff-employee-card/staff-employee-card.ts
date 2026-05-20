import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { StaffBarEntry } from '../../models/chart-data.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-staff-employee-card',
  imports: [AvatarComponent],
  templateUrl: './staff-employee-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffEmployeeCardComponent {
  readonly entry = input.required<StaffBarEntry>();
  readonly viewDetails = output<void>();

  readonly sredHrs = computed(() => Math.round(this.entry().sredValue));
  readonly unclaimedHrs = computed(() => Math.round(this.entry().unclaimedValue));
  readonly total = computed(() => this.entry().sredValue + this.entry().unclaimedValue);
  readonly sreddash = computed(() => {
    const t = this.total();
    return t > 0 ? ((113 * this.entry().sredValue) / t).toFixed(1) : '0';
  });
  readonly remaining = computed(() => (113 - parseFloat(this.sreddash())).toFixed(1));
  readonly lightColor = computed(() => this.entry().color + '33');
  readonly buttonBg = computed(() => this.entry().color + '1a');
}
