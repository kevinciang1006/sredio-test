import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-info-tooltip',
  imports: [TooltipDirective],
  templateUrl: './info-tooltip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoTooltipComponent {
  readonly text = input.required<string>();
  readonly position = input<'top' | 'bottom'>('top');
}
