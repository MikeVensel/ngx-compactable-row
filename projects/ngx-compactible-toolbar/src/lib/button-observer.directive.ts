import {
  type AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  type OnDestroy,
  output,
  signal,
} from '@angular/core';

import type { ToolbarItem } from '../models/toolbar-item';

/** Button observer directive. */
@Directive({
  selector: '[ngx-compactable-toolbar-button-observer]',
})
export class ButtonObserverDirective implements AfterViewInit, OnDestroy {
  /** Toolbar item associated with this button. */
  item = input.required<ToolbarItem>({
    alias: 'ngx-compactable-toolbar-button-observer',
  });

  /** Emits when the visibility of the button changes. */
  readonly visibilityChange = output<boolean>();
  /** Indicates whether the button is currently visible. */
  readonly isVisible = signal(false);

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private intersectionObserver?: IntersectionObserver;

  /**
   * Gets the width of the button element.
   *
   * @returns The width of the button in pixels.
   */
  get width(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }

  ngAfterViewInit(): void {
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry) {
        this.isVisible.set(entry.isIntersecting);
        this.visibilityChange.emit(entry.isIntersecting);
      }
    });

    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
  }
}
