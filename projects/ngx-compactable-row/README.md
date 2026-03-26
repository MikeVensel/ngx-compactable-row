# NgxCompactableRow

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build ngx-compactable-row
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

## Projected Toolbar Items

The toolbar now supports projected item templates in addition to `toolbarDefinition`.

```html
<ngx-compactable-row>
   <ng-template
      ngxCompactableItem
      [priority]="2"
      let-location="location"
      let-priority="priority"
      let-index="index"
   >
      @if (location === 'menu') {
         <button mat-menu-item [attr.data-toolbar-location]="location">
            <mat-icon>share</mat-icon>
            <span>Share</span>
         </button>
      } @else {
         <button mat-icon-button [attr.data-toolbar-location]="location">
            <mat-icon>share</mat-icon>
         </button>
      }
   </ng-template>
</ngx-compactable-row>
```

Template context values:

- `location`: `'toolbar' | 'menu'`
- `priority`: Priority from the directive input
- `index`: zero-based item index

When projected templates are present, the component automatically compacts items into the overflow menu and passes `location` so you can render different markup and set attributes accordingly. Use `[priority]` to configure the item and `let-priority="priority"` to read that value inside the template.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:

   ```bash
   cd dist/ngx-compactable-row
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
