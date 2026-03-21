import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { ButtonObserverDirective } from './button-observer.directive';

class MockIntersectionObserver implements IntersectionObserver {
  static lastInstance?: MockIntersectionObserver;

  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly takeRecords = vi.fn(() => []);
  readonly unobserve = vi.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.lastInstance = this;
  }

  emit(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this);
  }
}

@Component({
  template:
    '<button libButtonObserver (visibilityChange)="onVisibilityChange($event)"></button>',
  imports: [ButtonObserverDirective],
})
class TestHostComponent {
  visibilityChanges: boolean[] = [];

  onVisibilityChange(isVisible: boolean): void {
    this.visibilityChanges.push(isVisible);
  }
}

describe('ButtonObserver', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(async () => {
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    MockIntersectionObserver.lastInstance = undefined;
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  it('observes the host element', () => {
    const observer = MockIntersectionObserver.lastInstance;
    const button = fixture.nativeElement.querySelector('button');

    expect(observer).toBeTruthy();
    expect(observer?.observe).toHaveBeenCalledWith(button);
  });

  it('emits visibility changes from the intersection observer', () => {
    const observer = MockIntersectionObserver.lastInstance;

    observer?.emit(true);
    observer?.emit(false);

    expect(fixture.componentInstance.visibilityChanges).toEqual([true, false]);
  });

  it('disconnects the observer on destroy', () => {
    const observer = MockIntersectionObserver.lastInstance;

    fixture.destroy();

    expect(observer?.disconnect).toHaveBeenCalled();
  });
});
