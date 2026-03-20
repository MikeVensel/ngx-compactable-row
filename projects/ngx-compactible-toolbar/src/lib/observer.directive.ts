import {
  type AfterViewInit,
  Directive,
  ElementRef,
  inject,
  type OnDestroy,
  output,
  signal,
} from '@angular/core';

@Directive({
  selector: '[observer]',
})
export class ObserverDirective implements AfterViewInit, OnDestroy {
  readonly visibilityChange = output<boolean>();
  readonly isVisible = signal(false);

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private intersectionObserver?: IntersectionObserver;

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
