import {
  type AfterViewInit,
  Directive,
  ElementRef,
  inject,
  type OnDestroy,
  output,
  signal,
} from '@angular/core';

/** Observer directive. */
@Directive({
  selector: '[observer]',
})
export class ObserverDirective implements AfterViewInit, OnDestroy {
  /** Emits when the visibility of the element changes. */
  readonly visibilityChange = output<boolean>();
  /** Indicates whether the element is currently visible. */
  readonly isVisible = signal(false);

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private intersectionObserver?: IntersectionObserver;

  /**
   * Gets the width of the element.
   *
   * @returns The width of the element in pixels.
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
