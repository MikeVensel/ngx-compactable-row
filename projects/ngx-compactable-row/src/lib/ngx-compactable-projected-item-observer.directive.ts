import { Directive, ElementRef, inject, input } from '@angular/core';

/** Directive to observe a projected toolbar item for width changes. */
@Directive({
  selector: '[ngxCompactableProjectedItemObserver]',
})
export class NgxCompactableProjectedItemObserverDirective {
  /** The ID of the projected toolbar item. */
  readonly itemId = input.required<number>({
    alias: 'ngxCompactableProjectedItemObserver',
  });

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /**
   * Gets the current width of the projected toolbar item.
   *
   * @returns The width of the projected toolbar item in pixels.
   */
  get width(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}
