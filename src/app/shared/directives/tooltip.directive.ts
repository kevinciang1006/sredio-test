import { Directive, ElementRef, OnDestroy, Renderer2, inject, input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly appTooltip = input.required<string>();
  readonly appTooltipPosition = input<'top' | 'bottom'>('top');

  private tooltipEl: HTMLElement | null = null;

  show(): void {
    const text = this.appTooltip();
    if (!text || this.tooltipEl) return;

    const tip = this.renderer.createElement('div') as HTMLElement;
    const classes = [
      'pointer-events-none', 'fixed', 'z-[60]',
      'bg-gray-900', 'text-white', 'text-xs',
      'px-2', 'py-1', 'rounded', 'shadow-lg',
      'whitespace-nowrap', 'max-w-xs',
    ];
    for (const c of classes) this.renderer.addClass(tip, c);
    this.renderer.setProperty(tip, 'textContent', text);
    this.renderer.appendChild(document.body, tip);
    this.tooltipEl = tip;

    const host = this.elementRef.nativeElement as HTMLElement;
    const rect = host.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const pos = this.appTooltipPosition();

    const top = pos === 'top'
      ? rect.top - tipRect.height - 8
      : rect.bottom + 8;
    const left = rect.left + rect.width / 2 - tipRect.width / 2;

    const clampedLeft = Math.max(4, Math.min(left, window.innerWidth - tipRect.width - 4));
    const clampedTop = Math.max(4, top);

    this.renderer.setStyle(tip, 'top', `${clampedTop}px`);
    this.renderer.setStyle(tip, 'left', `${clampedLeft}px`);
  }

  hide(): void {
    if (!this.tooltipEl) return;
    this.renderer.removeChild(document.body, this.tooltipEl);
    this.tooltipEl = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
