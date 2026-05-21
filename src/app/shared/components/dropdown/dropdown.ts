import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';
import { Dropdown, type DropdownOptions } from 'flowbite';

export type DropdownPlacement =
  | 'bottom-start' | 'bottom-end' | 'bottom'
  | 'top-start' | 'top-end' | 'top'
  | 'right-start' | 'right-end' | 'right'
  | 'left-start' | 'left-end' | 'left';

@Component({
  selector: 'app-dropdown',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  readonly placement = input<DropdownPlacement>('bottom-start');
  readonly triggerType = input<'click' | 'hover'>('click');
  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private dropdown: Dropdown | null = null;

  constructor() {
    afterNextRender(() => {
      const trigger = this.host.nativeElement.querySelector('[appDropdownTrigger]') as HTMLElement | null;
      const menu = this.host.nativeElement.querySelector('[appDropdownMenu]') as HTMLElement | null;
      if (!trigger || !menu) return;
      menu.classList.add('hidden');
      const options: DropdownOptions = {
        placement: this.placement(),
        triggerType: this.triggerType(),
        onShow: () => this.opened.emit(),
        onHide: () => this.closed.emit(),
      };
      this.dropdown = new Dropdown(menu, trigger, options);
    });

    this.destroyRef.onDestroy(() => {
      this.dropdown?.hide();
      this.dropdown?.destroy();
      this.dropdown = null;
    });
  }

  show(): void { this.dropdown?.show(); }
  hide(): void { this.dropdown?.hide(); }
  toggle(): void { this.dropdown?.toggle(); }
}
