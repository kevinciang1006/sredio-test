import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SredMode, StaffBarEntry } from '../../models/chart-data.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar';

const CAD_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
});

@Component({
  selector: 'app-staff-employee-card',
  imports: [AvatarComponent],
  templateUrl: './staff-employee-card.html',
  styleUrl: './staff-employee-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffEmployeeCardComponent {
  readonly entry = input.required<StaffBarEntry>();
  readonly mode = input<SredMode>('hours');
  readonly viewDetails = output<void>();

  readonly total = computed(() => this.entry().sredValue + this.entry().unclaimedValue);

  readonly sreddash = computed(() => {
    const t = this.total();
    return t > 0 ? ((113 * this.entry().sredValue) / t).toFixed(1) : '0';
  });

  readonly unclaimedDash = computed(() => {
    const t = this.total();
    return t > 0 ? ((113 * this.entry().unclaimedValue) / t).toFixed(1) : '0';
  });

  readonly creditsDash = computed(() => {
    const t = this.total();
    return t > 0 ? ((113 * this.entry().creditsValue) / t).toFixed(1) : '0';
  });

  readonly showCreditsArc = computed(() => this.mode() === 'credits');

  readonly centerValue = computed(() => {
    const m = this.mode();
    if (m === 'credits') return CAD_FORMATTER.format(this.entry().creditsValue);
    if (m === 'hours') return Math.round(this.entry().sredValue).toLocaleString('en-CA');
    return CAD_FORMATTER.format(this.entry().sredValue);
  });

  readonly centerLabel = computed(() => {
    const m = this.mode();
    if (m === 'credits') return 'Credits';
    return m === 'hours' ? 'SR&ED hrs' : 'SR&ED $';
  });

  readonly showUnclaimedSubLabel = computed(() => this.mode() !== 'credits');

  readonly unclaimedDisplay = computed(() =>
    this.mode() === 'hours'
      ? `${Math.round(this.entry().unclaimedValue)} hrs unclaimed`
      : `${CAD_FORMATTER.format(this.entry().unclaimedValue)} unclaimed`
  );

  readonly buttonBg = computed(() => this.entry().color + '1a');
}
