import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { NgxCompactableRow } from './ngx-compactable-row';
import { NgxCompactableItemDirective } from '../ngx-compactable-item.directive';

@Component({
  imports: [NgxCompactableRow, NgxCompactableItemDirective],
  template: `
    <div class="host-wrapper">
      <ngx-compactable-row>
        @for (item of items; track item) {
          <ng-template
            ngxCompactableItem
            let-location="location"
            let-index="index"
          >
            <span
              class="projected-item"
              [attr.data-location]="location"
              [attr.data-index]="index"
            >
              {{ item }}
            </span>
          </ng-template>
        }
      </ngx-compactable-row>
    </div>
  `,
})
class HostComponent {
  items = ['One', 'Two', 'Three'];
}

describe('NgxCompactableRow', () => {
  let fixture: ComponentFixture<HostComponent>;
  let rowComponent: NgxCompactableRow;
  let originalRequestAnimationFrame: typeof requestAnimationFrame;

  beforeEach(async () => {
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = (() => {
      return 1;
    }) as typeof requestAnimationFrame;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    rowComponent = fixture.debugElement.children[0].children[0]
      .componentInstance as NgxCompactableRow;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it('creates projected states for all projected items', () => {
    expect(rowComponent).toBeTruthy();
    expect(rowComponent.projectedItemStates().map((state) => state.id)).toEqual(
      [0, 1, 2],
    );
    expect(rowComponent.projectedRootItems().length).toBe(3);
    expect(rowComponent.projectedMenuItems().length).toBe(0);
    expect(rowComponent.showMenu()).toBe(false);
  });

  it('moves trailing items into menu when available width shrinks', () => {
    setParentWidth(170);
    setProjectedWidths([80, 80, 80]);

    recomputeLayout();

    expect(rowComponent.projectedRootItems().map((item) => item.id)).toEqual([
      0,
    ]);
    expect(rowComponent.projectedMenuItems().map((item) => item.id)).toEqual([
      1, 2,
    ]);
    expect(rowComponent.showMenu()).toBe(true);
  });

  it('moves menu items back into toolbar when width grows', () => {
    setParentWidth(170);
    setProjectedWidths([80, 80, 80]);

    recomputeLayout();
    expect(rowComponent.projectedMenuItems().map((item) => item.id)).toEqual([
      1, 2,
    ]);

    setParentWidth(260);
    recomputeLayout();

    expect(rowComponent.projectedRootItems().map((item) => item.id)).toEqual([
      0, 1,
    ]);
    expect(rowComponent.projectedMenuItems().length).toBe(1);
    expect(rowComponent.showMenu()).toBe(true);
  });

  it('keeps an item in menu until there is enough space for default menu button width fallback', () => {
    setParentWidth(170);
    setProjectedWidths([80, 80, 80]);

    recomputeLayout();
    expect(rowComponent.projectedMenuItems().map((item) => item.id)).toEqual([
      1, 2,
    ]);

    setParentWidth(239);
    recomputeLayout();
    expect(rowComponent.projectedMenuItems().map((item) => item.id)).toEqual([
      1, 2,
    ]);

    setParentWidth(240);
    recomputeLayout();
    expect(rowComponent.projectedMenuItems().length).toBe(1);
  });

  it('accounts for menu button width at in-between breakpoints during compaction', () => {
    setProjectedWidths([80, 80, 80]);

    setParentWidth(207);
    recomputeLayout();
    expect(rowComponent.projectedRootItems().map((item) => item.id)).toEqual([
      0,
    ]);
    expect(rowComponent.projectedMenuItems().map((item) => item.id)).toEqual([
      1, 2,
    ]);

    setParentWidth(208);
    recomputeLayout();
    expect(rowComponent.projectedRootItems().map((item) => item.id)).toEqual([
      0,
    ]);
    expect(rowComponent.projectedMenuItems().map((item) => item.id)).toEqual([
      1, 2,
    ]);
  });

  function setParentWidth(width: number): void {
    const rowElement = fixture.nativeElement.querySelector(
      'ngx-compactable-row',
    ) as HTMLElement;
    const parentElement = rowElement.parentElement as HTMLElement;
    Object.defineProperty(parentElement, 'clientWidth', {
      configurable: true,
      get: () => width,
    });
  }

  function setProjectedWidths(widths: number[]): void {
    const projectedHosts = fixture.nativeElement.querySelectorAll(
      '.projected-item-host',
    ) as NodeListOf<HTMLElement>;
    projectedHosts.forEach((host, index) => {
      Object.defineProperty(host, 'offsetWidth', {
        configurable: true,
        get: () => widths[index] ?? 0,
      });
    });
  }

  function recomputeLayout(): void {
    (
      rowComponent as unknown as {
        updateProjectedItemVisibilities: () => void;
      }
    ).updateProjectedItemVisibilities();
  }
});
