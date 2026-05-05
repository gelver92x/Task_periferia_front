import { Component, computed, input } from '@angular/core';

import { TASK_STATUS_LABELS, TaskStatus } from '../../../domain/enums/task-status.enum';

@Component({
  selector: 'app-task-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './task-status-badge.component.html',
  styleUrl: './task-status-badge.component.scss',
})
export class TaskStatusBadgeComponent {
  readonly status = input.required<TaskStatus>();
  readonly label = computed(() => TASK_STATUS_LABELS[this.status()]);
}
