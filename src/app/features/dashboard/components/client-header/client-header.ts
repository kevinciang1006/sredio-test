import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Client, ClaimPeriod } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderComponent {
  readonly client = input<Client | null>(null);
  readonly isLoading = input(false);
  readonly activePeriod = input<ClaimPeriod | null>(null);
  readonly periodChange = output<string>();

  readonly isOpen = signal(false);

  toggle(): void { this.isOpen.update(v => !v); }
  select(periodId: string): void {
    this.periodChange.emit(periodId);
    this.isOpen.set(false);
  }

  formatRange(p: ClaimPeriod): string {
    const fmt = (d: string) => {
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };
    const year = p.endDate.slice(0, 4);
    return `${fmt(p.startDate)} – ${fmt(p.endDate)} ${year}`;
  }
}
