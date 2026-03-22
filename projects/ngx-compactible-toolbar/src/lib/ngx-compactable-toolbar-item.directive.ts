import { Directive, inject, TemplateRef } from '@angular/core';

export type NgxCompactableToolbarItemLocation = 'toolbar' | 'menu';

/** Describes the context for a compactable toolbar item template. */
export interface NgxCompactableToolbarItemContext {
  /**
   * Indicates the location where the item is being rendered. This can be either 'toolbar' or 'menu', allowing the template to adapt its content based on where it is displayed.
   */
  location: NgxCompactableToolbarItemLocation;
  /**
   * The index of the toolbar item within its location.
   */
  index: number;
}

/**
 * Directive to mark a template as a compactable toolbar item. This directive allows you to define a template that can be rendered in either the toolbar or the overflow menu, depending on the available space. The template receives a context that indicates where it is being rendered and its index within that location.
 */
@Directive({
  selector: 'ng-template[ngxCompactableToolbarItem]',
})
export class NgxCompactableToolbarItemDirective {
  /** The template reference for the compactable toolbar item. */
  readonly template = inject(TemplateRef<NgxCompactableToolbarItemContext>);
}
