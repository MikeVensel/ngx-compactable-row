import type { CompactableToolbarItemDefinition } from "./compactable-toolbar-definition";

export interface ToolbarItem extends CompactableToolbarItemDefinition {
	/** Unique identifier for the toolbar item. */
	id: number;
	/** Whether the item is currently in the menu. */
	isInMenu: boolean;
}
