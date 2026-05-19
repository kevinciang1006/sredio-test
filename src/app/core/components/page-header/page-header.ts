import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InfoTooltipComponent } from '../../../shared/components/info-tooltip/info-tooltip';

@Component({
  selector: 'app-page-header',
  imports: [InfoTooltipComponent],
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly badge = input<string | null>(null);
  readonly lastUpdatedAt = input<string | null>(null);
}
