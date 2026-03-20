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

@Directive({
  selector: '[ngx-compactable-toolbar-button-observer]',
})
export class ButtonObserverDirective implements AfterViewInit, OnDestroy {
  item = input.required<ToolbarItem>({
    alias: 'ngx-compactable-toolbar-button-observer',
  });

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
