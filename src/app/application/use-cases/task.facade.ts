import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';

import { TASK_REPOSITORY } from '../ports/task-repository.port';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class TaskFacade {
  private readonly taskRepository = inject(TASK_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  private readonly tasksSignal = signal<Task[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchQuerySignal = signal('');

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();

  readonly filteredTasks = computed(() => {
    const query = this.searchQuerySignal().trim().toLowerCase();

    if (!query) {
      return this.tasksSignal();
    }

    return this.tasksSignal().filter((task) => {
      const searchable = `${task.title} ${task.description} ${task.status}`.toLowerCase();
      return searchable.includes(query);
    });
  });

  readonly totalTasks = computed(() => this.tasksSignal().length);
  readonly pendingTasks = computed(
    () => this.tasksSignal().filter((task) => task.status === TaskStatus.Pending).length,
  );
  readonly inProgressTasks = computed(
    () => this.tasksSignal().filter((task) => task.status === TaskStatus.InProgress).length,
  );
  readonly doneTasks = computed(
    () => this.tasksSignal().filter((task) => task.status === TaskStatus.Done).length,
  );

  readonly tasks$ = toObservable(this.tasksSignal);
  readonly loading$ = toObservable(this.loadingSignal);

  loadTasks(): void {
    this.runRequest(this.taskRepository.findAll(), {
      success: (tasks) => this.tasksSignal.set(tasks),
      errorMessage: 'Could not load tasks.',
    });
  }

  createTask(payload: CreateTaskPayload): void {
    this.runRequest(this.taskRepository.create(payload), {
      success: (task) => {
        this.tasksSignal.update((tasks) => [task, ...tasks]);
        this.notificationService.success('Task created.');
      },
      errorMessage: 'Could not create task.',
    });
  }

  updateTask(id: string, payload: UpdateTaskPayload): void {
    this.runRequest(this.taskRepository.update(id, payload), {
      success: (updatedTask) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
        this.notificationService.success('Task updated.');
      },
      errorMessage: 'Could not update task.',
    });
  }

  deleteTask(id: string): void {
    this.runRequest(this.taskRepository.delete(id), {
      success: () => {
        this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
        this.notificationService.success('Task deleted.');
      },
      errorMessage: 'Could not delete task.',
    });
  }

  changeTaskStatus(task: Task, status: TaskStatus): void {
    this.updateTask(task.id, { status });
  }

  searchTasks(query: string): Task[] {
    this.searchQuerySignal.set(query);
    return this.filteredTasks();
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private runRequest<T>(
    request$: Observable<T>,
    handlers: {
      success: (value: T) => void;
      errorMessage: string;
    },
  ): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    request$.pipe(finalize(() => this.loadingSignal.set(false))).subscribe({
      next: handlers.success,
      error: () => {
        this.errorSignal.set(handlers.errorMessage);
        this.notificationService.error(handlers.errorMessage);
      },
    });
  }
}

