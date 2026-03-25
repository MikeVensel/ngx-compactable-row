import { Directive, inject, input, TemplateRef } from '@angular/core';

export type NgxCompactableItemLocation = 'toolbar' | 'menu';

/** Describes the context for a compactable toolbar item template. */
export interface NgxCompactableItemContext {
  /**
   * Indicates the location where the item is being rendered. This can be either 'toolbar' or 'menu', allowing the template to adapt its content based on where it is displayed.
   */
  location: NgxCompactableItemLocation;
  /**
   * Priority for the item template.
   * Items with a higher priority will stay in the root row longer than items with a lower priority.
   */
  priority: number;
  /**
   * The index of the toolbar item within its location.
   */
  index: number;
}

/**
 * Directive to mark a template as a compactable toolbar item. This directive allows you to define a template that can be rendered in either the toolbar or the overflow menu, depending on the available space. The template receives a context that indicates where it is displayed and its index within that location.
 */
@Directive({
  selector: 'ng-template[ngxCompactableItem]',
})
export class NgxCompactableItemDirective {
  /**
   * Priority exposed back to the template context.
   * Items with a higher priority will stay in the root row longer than items with a lower priority.
   */
  readonly priority = input(0);

  /** The template reference for the compactable toolbar item. */
  readonly template = inject(TemplateRef<NgxCompactableItemContext>);
}
