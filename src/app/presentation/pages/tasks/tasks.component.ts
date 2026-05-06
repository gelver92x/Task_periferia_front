import { Component, OnInit, inject, signal } from '@angular/core';

import { TaskFacade } from '../../../application/use-cases/task.facade';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../../domain/models/task.model';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { StatsCounterComponent } from '../../components/stats-counter/stats-counter.component';
import { StatusFilterBarComponent } from '../../components/status-filter-bar/status-filter-bar.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { FilterOption } from '../../components/status-filter-bar/status-filter-bar.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    LoadingSpinnerComponent,
    SearchBarComponent,
    StatsCounterComponent,
    StatusFilterBarComponent,
    TaskFormModalComponent,
    TaskListComponent,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  protected readonly facade          = inject(TaskFacade);
  protected readonly formOpen        = signal(false);
  protected readonly editingTask     = signal<Task | null>(null);
  protected readonly taskPendingDelete = signal<Task | null>(null);

  ngOnInit(): void {
    this.facade.loadTasks();
  }

  protected openCreateForm(): void {
    this.editingTask.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(task: Task): void {
    this.editingTask.set(task);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingTask.set(null);
  }

  protected saveTask(payload: CreateTaskPayload | UpdateTaskPayload): void {
    const task = this.editingTask();
    if (task) {
      this.facade.updateTask(task.id, payload);
    } else {
      this.facade.createTask(payload as CreateTaskPayload);
    }
    this.closeForm();
  }

  protected requestDelete(task: Task): void {
    this.taskPendingDelete.set(task);
  }

  protected confirmDelete(): void {
    const task = this.taskPendingDelete();
    if (task) this.facade.deleteTask(task.id);
    this.taskPendingDelete.set(null);
  }

  protected changeStatus(event: { task: Task; status: TaskStatus }): void {
    this.facade.changeTaskStatus(event.task, event.status);
  }

  protected onFilterChange(filter: FilterOption): void {
    this.facade.setStatusFilter(filter);
  }
}
