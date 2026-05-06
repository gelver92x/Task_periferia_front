import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskViewModel } from '../../view-models/task.view-model';
import { TaskStatusBadgeComponent } from '../task-status-badge/task-status-badge.component';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [TaskStatusBadgeComponent, DatePipe],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
})
export class TaskItemComponent {
  readonly task   = input.required<TaskViewModel>();
  readonly edit   = output<TaskViewModel>();
  readonly delete = output<TaskViewModel>();
  readonly statusChange = output<{ task: TaskViewModel; status: TaskStatus }>();

  protected readonly statuses = Object.values(TaskStatus);

  protected onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as TaskStatus;
    this.statusChange.emit({ task: this.task(), status });
  }
}
