import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StarFieldComponent } from './presentation/components/star-field/star-field.component';
import { ToastNotificationComponent } from './presentation/components/toast-notification/toast-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastNotificationComponent, StarFieldComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
