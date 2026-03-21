import {
  type AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  type OnDestroy,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { type CompactableToolbarDefinition } from '../../models/compactable-toolbar-definition';
import type { ToolbarItem } from '../../models/toolbar-item';
import { ButtonObserverDirective } from '../button-observer.directive';
import { MatIconButton } from '@angular/material/button';
import { ObserverDirective } from '../observer.directive';

/** The compactable toolbar component. */
@Component({
  selector: 'ngx-compactable-toolbar',
  imports: [
    MatIconButton,
    MatMenuModule,
    MatIcon,
    MatTooltip,
    ButtonObserverDirective,
    ObserverDirective,
  ],
  templateUrl: './ngx-compactable-toolbar.html',
  styleUrls: ['./ngx-compactable-toolbar.scss'],
})
export class NgxCompactableToolbar implements AfterViewInit, OnDestroy {
  /** Toolbar definition. */
  toolbarDefinition = input.required<CompactableToolbarDefinition>();

  /** Reference to all elements with the @see ButtonObserverDirective */
  toolbarButtonObservers = viewChildren(ButtonObserverDirective);
  /** Reference to the menu button element with the @see ObserverDirective */
  menuButtonObserver = viewChild(ObserverDirective);

  /** Current toolbar items. */
  items = signal<ToolbarItem[]>([]);
  /** Root toolbar items. */
  rootItems = computed(() => {
    const rootItems = this.items().filter((item) => !item.isInMenu);
    return rootItems;
  });
  /** Menu toolbar items. */
  menuItems = computed(() => {
    const menuItems = this.items().filter((item) => item.isInMenu);
    return menuItems;
  });
  /** Indicates whether the menu should be shown. */
  showMenu = computed(
    () => this.menuItems().length > 0 && this.menuItems().some((i) => i.render()),
  );

  private readonly elementRef = inject(ElementRef);
  private readonly itemWidths = new Map<number, number>();
  private resizeObserver?: ResizeObserver;
  private resizeObserverInitFrameId?: number;
  private shouldSkipNextResizeEvent = true;

  constructor() {
    explicitEffect([this.toolbarDefinition], ([toolbarDefinition]) => {
      const items: ToolbarItem[] = toolbarDefinition.items.map((item, index) => ({
        ...item,
        id: index,
        isInMenu: item.alwaysAppearInMenu ?? false,
      }));

      this.items.set(items);
    });
  }

  ngAfterViewInit(): void {
    const attachObserver = () => {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.shouldSkipNextResizeEvent) {
          this.shouldSkipNextResizeEvent = false;
          return;
        }

        this.updateItemVisibilities();
      });

      this.resizeObserver.observe(
        this.elementRef.nativeElement.parentElement ?? this.elementRef.nativeElement,
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

  private updateItemVisibilities(): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement;
    const availableWidth = this.getAvailableWidth(hostEl);

    // Refresh cached widths for all currently-rendered root buttons
    for (const observer of this.toolbarButtonObservers()) {
      const w = observer.width;
      if (w > 0) {
        this.itemWidths.set(observer.item().id, w);
      }
    }

    const menuButtonWidth = this.menuButtonObserver()?.width ?? 40;
    const updated = this.items().map((i) => ({ ...i }));

    let rootWidth =
      updated
        .filter((i) => !i.isInMenu)
        .reduce((sum, i) => sum + (this.itemWidths.get(i.id) ?? 0), 0) +
      (this.showMenu() ? menuButtonWidth : 0);

    if (rootWidth > availableWidth) {
      // Shrinking: move root items into the menu from last to first
      for (let i = updated.length - 1; i >= 0; i--) {
        const item = updated[i];
        if (item.isInMenu || item.alwaysAppearInMenu) continue;
        rootWidth -= this.itemWidths.get(item.id) ?? 0;
        item.isInMenu = true;
        if (rootWidth <= availableWidth) break;
      }
    } else {
      // Growing: try to restore menu items to root, leftmost hidden item first
      let remainingMenuCount = updated.filter((i) => i.isInMenu && !i.alwaysAppearInMenu).length;
      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        if (!item.isInMenu || item.alwaysAppearInMenu) continue;
        const itemWidth = this.itemWidths.get(item.id) ?? 0;
        // If this is the last menu item, the menu button also disappears, freeing its space
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

    this.items.set(updated);
  }
}
