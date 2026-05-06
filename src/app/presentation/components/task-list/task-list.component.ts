import { Component, input, output } from '@angular/core';

import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { Task } from '../../../domain/models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent {
  readonly tasks   = input.required<Task[]>();
  readonly loading = input(false);
  readonly edit    = output<Task>();
  readonly delete  = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();

  /** Array de 9 elementos para mostrar una cuadrícula 3x3 de skeletons */
  protected readonly skeletons = Array(9).fill(null);
}
