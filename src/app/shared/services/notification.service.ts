import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error' | 'warning' | 'info';

export type AppNotification = {
  id: number;
  kind: NotificationKind;
  message: string;
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private nextId = 1;
  private readonly notificationsSignal = signal<AppNotification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.notificationsSignal.update((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
  }

  private show(kind: NotificationKind, message: string): void {
    const notification: AppNotification = {
      id: this.nextId,
      kind,
      message,
    };

    this.nextId += 1;
    this.notificationsSignal.update((notifications) => [...notifications, notification]);

    window.setTimeout(() => this.dismiss(notification.id), 3800);
  }
}

