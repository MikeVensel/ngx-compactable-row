import {
  NgxCompactableRow,
  NgxCompactableItemDirective,
} from 'ngx-compactable-row';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-view',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIcon,
    NgxCompactableRow,
    NgxCompactableItemDirective,
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
})
export class ViewComponent {
  readonly shareDisabledWriteable = signal(false);

  onClickClose(): void {
    this.shareDisabledWriteable.update((isDisabled) => {
      return !isDisabled;
    });
  }

  onShare(): void {
    alert('Share clicked');
  }

  onFavorite(): void {
    alert('Favorite clicked');
  }

  onAccount(): void {
    alert('Account clicked');
  }

  onVisibility(): void {
    alert('Visibility clicked');
  }
}
