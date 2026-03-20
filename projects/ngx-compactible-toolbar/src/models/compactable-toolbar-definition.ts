import type { Signal } from '@angular/core';

export interface CompactableToolbarDefinition {
  items: CompactableToolbarItemDefinition[];
}

export interface CompactableToolbarItemDefinition {
  /**
   * Whether the button should always appear in the more menu.
   *
   * Defaults to false.
   */
  alwaysAppearInMenu?: boolean;
  /** Click handler for the button. */
  click: () => void;
  /**
   * Condition that disables the button.
   */
  disabled?: Signal<boolean>;
  /** Icon for the button when it is in the root. */
  icon: string;
  /** Label for the button when it is in the more menu. */
  label: string;
  /** Condition that determines whether the button should be rendered. */
  render: Signal<boolean>;
  /** Tooltip for the button when it is in the root. */
  tooltip: string;
}
