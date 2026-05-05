import { Component, inject } from '@angular/core';

import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss',
})
export class ToastNotificationComponent {
  protected readonly notificationService = inject(NotificationService);
}
