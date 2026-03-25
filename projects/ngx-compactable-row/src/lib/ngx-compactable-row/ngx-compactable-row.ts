import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import {
  type AfterViewInit,
  Component,
  computed,
  contentChildren,
  ElementRef,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { NgxCompactableProjectedItemDirective } from '../ngx-compactable-projected-item.directive';
import { NgxCompactableItemDirective } from '../ngx-compactable-item.directive';

/** Default width for the menu button if it cannot be retrieved from the DOM. */
const DEFAULT_MENU_BUTTON_WIDTH = 48;

// /** Describes the state of a projected toolbar item. */
interface ProjectedItemState {
  /** Item Id. */
  id: number;
  /** Indicates whether the item is currently in the menu. */
  isInMenu: boolean;
  /** The template for the projected item. */
  template: NgxCompactableItemDirective;
}

/** Menu button position in the row. */
export type MenuButtonPosition = 'start' | 'end';

/** The compactable toolbar component. */
@Component({
  selector: 'ngx-compactable-row',
  imports: [
    NgTemplateOutlet,
    MatIconButton,
    MatMenuModule,
    MatIcon,
    NgxCompactableProjectedItemDirective,
  ],
  templateUrl: './ngx-compactable-row.html',
  styleUrls: ['./ngx-compactable-row.scss'],
})
export class NgxCompactableRow implements AfterViewInit {
  /**
   * Extra buffer space in pixels to be subtracted from the available width when calculating item visibility.
   *
   * Defaults to 32.
   */
  buffer = input<number>(32);
  /** Position of the menu button in the row. Defaults to end. */
  menuButtonPosition = input<MenuButtonPosition>('end');
  /** Projected toolbar items rendered from templates. */
  projectedItemTemplates = contentChildren(NgxCompactableItemDirective);

  /** Reference to projected toolbar item wrappers for width measurement. */
  projectedToolbarItemObservers = viewChildren(
    NgxCompactableProjectedItemDirective,
  );
  /** Projected item states tracked for compacting behavior. */
  projectedItemStates = signal<ProjectedItemState[]>([]);
  /** Projected toolbar items currently rendered in the root area. */
  projectedRootItems = computed<ProjectedItemState[]>(() => {
    const templates = this.projectedItemTemplates();
    const states = this.projectedItemStates();
    return templates
      .map((template, index) => ({
        id: index,
        isInMenu: states[index]?.isInMenu ?? false,
        template,
      }))
      .filter((item) => !item.isInMenu);
  });
  /** Projected toolbar items currently rendered in the overflow menu. */
  projectedMenuItems = computed<ProjectedItemState[]>(() => {
    const templates = this.projectedItemTemplates();
    const states = this.projectedItemStates();
    return templates
      .map((template, index) => ({
        id: index,
        isInMenu: states[index]?.isInMenu ?? false,
        template,
      }))
      .filter((item) => item.isInMenu);
  });
  /** Indicates whether the menu should be shown. */
  showMenu = computed(() => this.projectedMenuItems().length > 0);

  private readonly elementRef = inject(ElementRef);
  private menuButtonElement = viewChild('menuButton', { read: ElementRef });
  private readonly projectedItemWidths = new Map<number, number>();
  private resizeObserver?: ResizeObserver;
  private resizeObserverInitFrameId?: number;
  private shouldSkipNextResizeEvent = true;

  constructor() {
    effect(() => {
      const templates = this.projectedItemTemplates();
      const previous = new Map(
        untracked(this.projectedItemStates).map((state) => [state.id, state]),
      );

      this.projectedItemStates.set(
        templates.map((_, index) => ({
          id: index,
          isInMenu: previous.get(index)?.isInMenu ?? false,
          template: templates[index],
        })),
      );
    });
  }

  ngAfterViewInit(): void {
    const attachObserver = () => {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.shouldSkipNextResizeEvent) {
          this.shouldSkipNextResizeEvent = false;
          return;
        }

        this.updateProjectedItemVisibilities();
      });

      this.resizeObserver.observe(
        this.elementRef.nativeElement.parentElement ??
          this.elementRef.nativeElement,
      );
    };

    if (typeof requestAnimationFrame === 'function') {
      this.resizeObserverInitFrameId = requestAnimationFrame(() => {
        this.resizeObserverInitFrameId = undefined;
        attachObserver();
      });
      return;
    }

    attachObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserverInitFrameId !== undefined) {
      cancelAnimationFrame(this.resizeObserverInitFrameId);
      this.resizeObserverInitFrameId = undefined;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private getAvailableWidth(hostEl: HTMLElement): number {
    const parentEl = hostEl.parentElement;
    if (!parentEl) return hostEl.clientWidth;
    // Only subtract siblings that don't flex-grow; a flex-grow sibling (e.g. a spacer)
    // will absorb the leftover space and does not consume fixed width.
    let fixedSiblingsWidth = 0;
    for (const child of Array.from(parentEl.children)) {
      if (child === hostEl) continue;
      if (getComputedStyle(child).flexGrow !== '0') continue;
      fixedSiblingsWidth += (child as HTMLElement).offsetWidth;
    }
    return parentEl.clientWidth - fixedSiblingsWidth;
  }

  private updateProjectedItemVisibilities(): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement;
    const availableWidth = this.getAvailableWidth(hostEl) - this.buffer();

    for (const observer of this.projectedToolbarItemObservers()) {
      const width = observer.width;
      if (width > 0) {
        this.projectedItemWidths.set(observer.itemId(), width);
      }
    }

    const menuButtonWidth =
      this.menuButtonElement()?.nativeElement.offsetWidth ??
      DEFAULT_MENU_BUTTON_WIDTH;
    // Copy the projected items state without changing the originals.
    const projectedItemStatesCopy = this.projectedItemStates().map((state) => ({
      ...state,
    }));

    let rootWidth =
      projectedItemStatesCopy
        .filter((item) => !item.isInMenu)
        .reduce(
          (sum, item) => sum + (this.projectedItemWidths.get(item.id) ?? 0),
          0,
        ) +
      (projectedItemStatesCopy.some((item) => item.isInMenu)
        ? menuButtonWidth
        : 0);

    if (rootWidth > availableWidth) {
      let hasMenuItem = projectedItemStatesCopy.some((item) => item.isInMenu);
      for (let i = projectedItemStatesCopy.length - 1; i >= 0; i--) {
        const item = projectedItemStatesCopy[i];
        if (item.isInMenu) continue;
        rootWidth -= this.projectedItemWidths.get(item.id) ?? 0;
        item.isInMenu = true;

        if (!hasMenuItem) {
          rootWidth += menuButtonWidth;
          hasMenuItem = true;
        }

        if (rootWidth <= availableWidth) break;
      }
    } else {
      let remainingMenuCount = projectedItemStatesCopy.filter(
        (item) => item.isInMenu,
      ).length;
      for (let i = 0; i < projectedItemStatesCopy.length; i++) {
        const item = projectedItemStatesCopy[i];
        if (!item.isInMenu) continue;
        const itemWidth = this.projectedItemWidths.get(item.id) ?? 0;
        const menuRelease = remainingMenuCount === 1 ? menuButtonWidth : 0;
        if (rootWidth + itemWidth - menuRelease <= availableWidth) {
          item.isInMenu = false;
          rootWidth += itemWidth - menuRelease;
          remainingMenuCount--;
        } else {
          break;
        }
      }
    }

    this.projectedItemStates.set(projectedItemStatesCopy);
  }
}
