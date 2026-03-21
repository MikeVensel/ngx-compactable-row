import {
  CompactableToolbarDefinition,
  NgxCompactableToolbar,
} from 'ngx-compactible-toolbar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-view',
  imports: [MatToolbarModule, MatButtonModule, MatIcon, NgxCompactableToolbar],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
})
export class ViewComponent {
  private shareDisabledWriteable = signal(false);

  toolbarbuttonDefintions: CompactableToolbarDefinition = {
    items: [
      {
        label: 'Share',
        alwaysAppearInMenu: false,
        icon: 'share',
        tooltip: 'Share this item',
        click: () => alert('Share clicked'),
        render: signal(true),
        disabled: this.shareDisabledWriteable,
      },
      {
        label: 'Favorite',
        alwaysAppearInMenu: false,
        icon: 'favorite',
        tooltip: 'Favorite this item',
        click: () => alert('Favorite clicked'),
        render: signal(true),
        disabled: signal(false),
      },
      {
        label: 'Account',
        alwaysAppearInMenu: false,
        icon: 'account_circle',
        tooltip: 'Account settings',
        click: () => alert('Account clicked'),
        render: signal(true),
        disabled: signal(false),
      },
      {
        label: 'Visibility',
        alwaysAppearInMenu: false,
        icon: 'visibility',
        tooltip: 'Visibility settings',
        click: () => alert('Visibility clicked'),
        render: signal(true),
        disabled: signal(false),
      },
    ],
  };

  onClickClose(): void {
    this.shareDisabledWriteable.update((isDisabled) => {
      return !isDisabled;
    });
  }
}
