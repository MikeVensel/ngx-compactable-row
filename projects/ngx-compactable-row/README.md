# NgxCompactableRow

NgxCompactableRow allows you to create a row of button elements which can automatically move into a menu if the screen becomes
to small.

## Use

Add the `NgxCompactableRow` and `NgxCompactableItemDirective` as imports to either your `app.module.ts` imports or your component's imports if using a standalone component.

Then add a compactable row with any number of elements.

```html
<ngx-compactable-row>
    <ng-template ngxCompactableItem [priority]="1" let-location="location" let-priority="priority">
      @if (location === 'menu') {
        <button
          mat-menu-item
          (click)="onSave()"
          [attr.data-toolbar-location]="location"
        >
          <mat-icon>save</mat-icon>
          <span>Save</span>
        </button>
      } @else {
        <button
          mat-icon-button
          (click)="onShare()"
          [attr.data-toolbar-location]="location"
        >
          <mat-icon>share</mat-icon>
        </button>
      }
    </ng-template>
  </ngx-compactable-row>
```

Each element should have both a menu template (for use when the item goes into the menu) and a default template which will render the element in the root of the row.


Template context values:

- `location`: `'toolbar' | 'menu'`
- `priority`: Priority from the directive input
- `index`: Index assigned to the item.

The component automatically compacts items into the overflow menu and passes `location` so you can render different markup and set attributes accordingly. Use `[priority]` to configure the item and `let-priority="priority"` to read that value inside the template.
