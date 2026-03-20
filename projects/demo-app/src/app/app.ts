import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewComponent } from './view/view.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('demo-app');
}
