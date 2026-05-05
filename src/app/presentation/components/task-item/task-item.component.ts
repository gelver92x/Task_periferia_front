import { Component, input, output } from '@angular/core';

import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { Task } from '../../../domain/models/task.model';
import { TaskStatusBadgeComponent } from '../task-status-badge/task-status-badge.component';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [TaskStatusBadgeComponent],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  readonly edit = output<Task>();
  readonly delete = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();

  protected readonly statuses = Object.values(TaskStatus);
  protected readonly taskStatus = TaskStatus;

  protected onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as TaskStatus;
    this.statusChange.emit({ task: this.task(), status });
  }
}
