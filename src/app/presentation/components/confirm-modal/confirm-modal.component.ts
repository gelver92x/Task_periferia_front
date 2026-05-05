import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  readonly open = input(false);
  readonly title = input('Confirm action');
  readonly message = input('This action cannot be undone.');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly destructive = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
