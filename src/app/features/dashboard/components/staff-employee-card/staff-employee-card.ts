import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SredMode, StaffBarEntry, StaffDisplayMode } from '../../models/chart-data.model';
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
  readonly displayMode = input<StaffDisplayMode>('both');
  readonly viewDetails = output<void>();

  readonly total = computed(() => this.entry().sredValue + this.entry().unclaimedValue);
  readonly sredFraction = computed(() => {
    const t = this.total();
    return t > 0 ? (113 * this.entry().sredValue) / t : 0;
  });
  readonly sreddash = computed(() => this.sredFraction().toFixed(1));
  readonly remaining = computed(() => (113 - this.sredFraction()).toFixed(1));
  readonly lightColor = () => '#9ca3af';
  readonly buttonBg = computed(() => this.entry().color + '1a');

  readonly sredDisplay = computed(() =>
    this.mode() === 'hours'
      ? `${Math.round(this.entry().sredValue).toLocaleString('en-CA')}`
      : CAD_FORMATTER.format(this.entry().sredValue)
  );
  readonly unclaimedDisplay = computed(() =>
    this.mode() === 'hours'
      ? `${Math.round(this.entry().unclaimedValue)} hrs unclaimed`
      : `${CAD_FORMATTER.format(this.entry().unclaimedValue)} unclaimed`
  );
  readonly gaugeLabel = computed(() => this.mode() === 'hours' ? 'SR&ED hrs' : 'SR&ED $');

  readonly centerValue = computed(() => {
    if (this.displayMode() === 'unclaimed') {
      return this.mode() === 'hours'
        ? Math.round(this.entry().unclaimedValue).toLocaleString('en-CA')
        : CAD_FORMATTER.format(this.entry().unclaimedValue);
    }
    return this.sredDisplay();
  });

  readonly centerLabel = computed(() => {
    if (this.displayMode() === 'unclaimed') {
      return this.mode() === 'hours' ? 'unclaimed hrs' : 'unclaimed $';
    }
    return this.gaugeLabel();
  });

  readonly showUnclaimedSubLabel = computed(() =>
    this.displayMode() !== 'unclaimed' && this.mode() !== 'credits'
  );
}
