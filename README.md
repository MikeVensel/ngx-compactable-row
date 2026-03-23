# NgxMatCompactableRow

NgxCompactableRow allows you to create a row of button elements which can automatically move into a menu if the screen becomes
to small.

## Use

Add the `NgxCompactableRow` and `NgxCompactableItemDirective` as imports to either your `app.module.ts` imports or your component's imports if using a standalone component.

Then add a compactable row with any number of elements.

```html
<ngx-compactable-row>
    <ng-template ngxCompactableItem let-location="location">
      @if (location === 'menu') {
        <button
          mat-menu-item
          (click)="onShare()"
          [disabled]="shareDisabledWriteable()"
          [attr.data-toolbar-location]="location"
        >
          <mat-icon>share</mat-icon>
          <span>Share</span>
        </button>
      } @else {
        <button
          mat-icon-button
          (click)="onShare()"
          [disabled]="shareDisabledWriteable()"
          [attr.data-toolbar-location]="location"
        >
          <mat-icon>share</mat-icon>
        </button>
      }
    </ng-template>
  </ngx-compactable-row>
```

Each element should have both a menu template (for use when the item goes into the menu) and a default template which will render the element in the root of the row.
