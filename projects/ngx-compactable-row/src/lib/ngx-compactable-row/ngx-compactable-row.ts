import { take } from 'rxjs';
import {
  MatMenu,
  MAT_MENU_PANEL,
  MatMenuModule,
  MatMenuTrigger,
  MatMenuItem,
} from '@angular/material/menu';
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
  Injector,
  signal,
  untracked,
  viewChild,
  viewChildren,
  input,
  ChangeDetectorRef,
  AfterViewChecked,
  booleanAttribute,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { NgxCompactableProjectedItemDirective } from '../ngx-compactable-projected-item.directive';
import { NgxCompactableItemDirective } from '../ngx-compactable-item.directive';

/** Default width for the menu button if it cannot be retrieved from the DOM. */
const DEFAULT_MENU_BUTTON_WIDTH = 48;

/** Describes the state of a projected toolbar item. */
interface ProjectedItemState {
  /** Item Id. */
  id: number;
  /** Indicates whether the item is currently in the menu. */
  isInMenu: boolean;
  /** The template for the projected item. */
  template: NgxCompactableItemDirective;
}

/** Describes a partial implementation of MatMenuTrigger's internal API. */
interface InternalOpenMenuTrigger {
  /** Internal open method exposed by MatMenuTrigger. */
  _openMenu: (autoFocus: boolean) => void;
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
export class NgxCompactableRow implements AfterViewChecked, AfterViewInit {
  /**
   * Extra buffer space in pixels to be subtracted from the available width when calculating item visibility.
   *
   * Defaults to 32.
   */
  buffer = input<number>(32);
  /**
   * Determines if available space should be checked during the view check lifecycle hook.
   *
   * This is useful if row elements may be added or removed dynamically.
   */
  checkAvailableSpaceAfterViewCheck = input(false, {
    transform: booleanAttribute,
  });
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
  private readonly injectorRef = inject(Injector);
  private menuButtonElement = viewChild('menuButton', { read: ElementRef });
  private moreMenu = viewChild<MatMenu>('moreMenu');
  // private readonly hoveredMenuTrigger = signal<MatMenuTrigger | null>(null);
  private activeMenu = signal<{
    /** MatMenuTrigger associated with the active menu. */
    trigger: MatMenuTrigger;
    /** MatMenuItem associated with the active menu. */
    item: MatMenuItem;
  } | null>(null);
  /** Injector providing this menu as the MAT_MENU_PANEL root for nested menu triggers. */
  moreMenuInjector = computed(() => {
    const menu = this.moreMenu();
    if (!menu) return null;
    return Injector.create({
      providers: [{ provide: MAT_MENU_PANEL, useValue: menu }],
      parent: this.injectorRef,
    });
  });
  private readonly projectedItemWidths = new Map<number, number>();
  private resizeObserver?: ResizeObserver;
  private resizeObserverInitFrameId?: number;
  private shouldSkipNextResizeEvent = true;

  constructor(private cdr: ChangeDetectorRef) {
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

  ngAfterViewChecked(): void {
    if (this.checkAvailableSpaceAfterViewCheck()) {
      this.updateProjectedItemVisibilities();
    }
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
        // immediately set item visibility and then attach the resize observer when appropriate.
        this.updateProjectedItemVisibilities();
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

  /** Closes the last active submenu. */
  closeSubmenu(): void {
    const activeMenu = this.activeMenu();
    if (activeMenu) {
      this.clearMenuItemHighlight(activeMenu.item);
      activeMenu.trigger.closeMenu();
      this.activeMenu.set(null);
    }
  }

  /**
   * Opens the given trigger's menu and attaches panel hover guards to prevent premature close.
   *
   * @param trigger The menu trigger to open.
   * @param item The menu item associated with the trigger, used for applying highlight state while the menu is open.
   */
  openSubmenu(trigger: MatMenuTrigger, item: MatMenuItem): void {
    const previousMenu = this.activeMenu();
    if (previousMenu && previousMenu.trigger !== trigger) {
      this.clearMenuItemHighlight(previousMenu.item);
      previousMenu.trigger.closeMenu();
    }

    this.openMenuForHover(trigger);
    this.activeMenu.set({ trigger, item });

    trigger.menuClosed.pipe(take(1)).subscribe(() => {
      this.clearMenuItemHighlight(item);
      if (this.activeMenu()?.trigger === trigger) {
        this.activeMenu.set(null);
      }
    });
  }

  /**
   * Opens the given trigger's menu as if it was hovered. This is intended to be used on menus that were added to the more menu
   * as part of the effort to open submenus the same as material does it.
   *
   * @param trigger Menu trigger.
   */
  private openMenuForHover(trigger: MatMenuTrigger): void {
    try {
      // Cast the menu trigger to internal interface so the protected _openMenu function can be called.
      const internalTrigger = trigger as unknown as InternalOpenMenuTrigger;
      internalTrigger._openMenu(false);
    } catch (error) {
      // As a fallback, open the menu through the public API.
      console.error(
        'Failed to open submenu through internal API, falling back to public API.',
        error,
      );
      trigger.openMenu();
    }
  }

  private clearMenuItemHighlight(item: MatMenuItem): void {
    item._setHighlighted(false);

    const hostElement = (
      item as unknown as {
        // oxlint-disable-next-line jsdoc-js/require-jsdoc
        _elementRef?: ElementRef<HTMLElement>;
      }
    )._elementRef?.nativeElement;

    if (hostElement) {
      hostElement.classList.remove(
        'mat-mdc-menu-item-highlighted',
        'mat-menu-item-highlighted',
      );
      hostElement.blur();
    }

    this.cdr.markForCheck();
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
    let availableWidth = this.getAvailableWidth(hostEl) - this.buffer();

    // Width may be temporarily unavailable before layout settles.
    // Treat negative widths as zero so the compaction logic still runs
    // and items can be moved into the menu when there is no space.
    if (availableWidth < 0) {
      availableWidth = 0;
    }

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

    const sortedProjectedItems = [...projectedItemStatesCopy].sort(
      (a, b) => b.template.priority() - a.template.priority() || a.id - b.id, // Preserve original order for items with the same priority
    );

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
      let hasMenuItem = sortedProjectedItems.some((item) => item.isInMenu);
      for (let i = sortedProjectedItems.length - 1; i >= 0; i--) {
        const item = sortedProjectedItems[i];
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
      let remainingMenuCount = sortedProjectedItems.filter(
        (item) => item.isInMenu,
      ).length;
      for (let i = 0; i < sortedProjectedItems.length; i++) {
        const item = sortedProjectedItems[i];
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
