# NgxCompactableRow

NgxCompactableRow allows you to create a row of button elements which can automatically move into a menu if the screen becomes
to small. A basic demo is available at https://mikevensel.github.io/ngx-compactable-row/.

## Use

Install with:

```sh
npm install @relynn/ngx-compactable-row
# OR
yarn add @relynn/ngx-compactable-row
```

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

### Check visibility after view check

The `ngx-compactable-row` component checks the available size and moves items whenever it detects resize events. However, the available space may not be updated in some scenarios such as if the buttons are wrapped in an `@if` that may return true after available space has already been calculated. This can be fixed by running the visibility updates after each view check by setting `checkAvailableSpaceAfterViewCheck` on the `ngx-compactable-row` component. This will run the visibilty checks in the `ngAfterViewChecked` lifecycle hook.

### Using mat-menu's in the row

Angular Material's mat menu allows you to nest submenus within menus. However, attempting to do so in components like this one
where the menu items might not be direct descendents of causes issues with behavior. This library attempts to patch it but it requires
that you add a `mouseenter` event handler as shown below:

```html
<ngx-compactable-row #compactableRow>
  <ng-template ngxCompactableItem let-location="location">
    @if (location === 'menu') {
      <button
        #attachmentTrigger="matMenuTrigger"
        #attachmentItem="matMenuItem"
        mat-menu-item
        [matMenuTriggerFor]="attachmentsMenu"
        [attr.data-toolbar-location]="location"
        (mouseenter)="compactableRow.openSubmenu(attachmentTrigger, attachmentItem)"
      >
        <mat-icon>attach_file</mat-icon>
        <span>Attachments</span>
      </button>
    } @else {
      <button
        mat-icon-button
        [matMenuTriggerFor]="attachmentsMenu"
        [attr.data-toolbar-location]="location"
      >
        <mat-icon>attach_file</mat-icon>
      </button>
    }
  </ng-template>
</ngx-compactable-row>

<mat-menu class="ngx-compactable-menu" #attachmentsMenu="matMenu">
  <button mat-menu-item>
    <span>Attachment 1</span>
  </button>
  <button mat-menu-item [matMenuTriggerFor]="attachmentTwoMenu">
    <span>Attachment 2</span>
  </button>
  <button mat-menu-item>
    <span>Attachment 3</span>
  </button>
</mat-menu>
<mat-menu #attachmentTwoMenu="matMenu">
  <button mat-menu-item>
    <span>Attachment 2.1</span>
  </button>
  <button mat-menu-item>
    <span>Attachment 2.2</span>
  </button>
  <button mat-menu-item>
    <span>Attachment 2.3</span>
  </button>
</mat-menu>
```

This functionality relies on Angular Materia's internal API to function correctly. If the internal API changes the default behavior for opening a menu will be present. This will function but some styling and behavior changes will occur if compared with how nested menus work outside this component.
