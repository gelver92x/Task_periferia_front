import { computed, inject, Injectable, signal } from '@angular/core';

import { ChangeTaskStatusUseCase } from '../../application/use-cases/change-task-status.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { ListTasksPageUseCase } from '../../application/use-cases/list-tasks-page.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';
import { NotificationService } from '../../shared/services/notification.service';

const PAGE_SIZE = 9;
const INITIAL_LOADING_DELAY_MS = 2000;
const LOAD_MORE_DELAY_MS = 3000;

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  private readonly listTasksPageUseCase = inject(ListTasksPageUseCase);
  private readonly createTaskUseCase = inject(CreateTaskUseCase);
  private readonly updateTaskUseCase = inject(UpdateTaskUseCase);
  private readonly deleteTaskUseCase = inject(DeleteTaskUseCase);
  private readonly changeTaskStatusUseCase = inject(ChangeTaskStatusUseCase);
  private readonly notificationService = inject(NotificationService);

  private readonly tasksSignal = signal<Task[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly loadingMoreSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchQuerySignal = signal('');
  private readonly statusFilterSignal = signal<TaskStatus | 'all'>('all');

  private readonly currentPageSignal = signal(1);
  private readonly hasMoreSignal = signal(true);
  private readonly totalSignal = signal(0);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loadingMore = this.loadingMoreSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly hasMore = this.hasMoreSignal.asReadonly();
  readonly totalAll = this.totalSignal.asReadonly();
  readonly statusFilter = this.statusFilterSignal.asReadonly();

  readonly filteredTasks = computed(() => {
    const query = this.searchQuerySignal().trim().toLowerCase();
    const status = this.statusFilterSignal();
    let list = this.tasksSignal();

    if (status !== 'all') {
      list = list.filter((task) => task.status === status);
    }

    if (!query) {
      return list;
    }

    return list.filter((task) =>
      `${task.title} ${task.description ?? ''} ${task.status}`.toLowerCase().includes(query),
    );
  });

  readonly totalTasks = computed(() => this.totalSignal());
  readonly pendingTasks = computed(
    () => this.tasksSignal().filter((task) => task.status === TaskStatus.Pending).length,
  );
  readonly inProgressTasks = computed(
    () => this.tasksSignal().filter((task) => task.status === TaskStatus.InProgress).length,
  );
  readonly doneTasks = computed(
    () => this.tasksSignal().filter((task) => task.status === TaskStatus.Done).length,
  );

  loadTasks(): void {
    this.currentPageSignal.set(1);
    this.hasMoreSignal.set(true);
    this.tasksSignal.set([]);

    void this.runRequest(
      async () => {
        await this.delay(INITIAL_LOADING_DELAY_MS);
        const result = await this.listTasksPageUseCase.execute({ page: 1, limit: PAGE_SIZE });

        this.tasksSignal.set(result.data ?? []);
        this.hasMoreSignal.set(result.hasMore ?? false);
        this.totalSignal.set(result.total ?? result.data?.length ?? 0);
        this.currentPageSignal.set(1);
      },
      'No se pudieron cargar las tareas.',
    );
  }

  loadMoreTasks(): void {
    if (this.loadingMoreSignal() || !this.hasMoreSignal()) {
      return;
    }

    void this.runLoadMoreRequest();
  }

  createTask(payload: CreateTaskPayload): void {
    void this.runRequest(
      async () => {
        const task = await this.createTaskUseCase.execute(payload);
        this.tasksSignal.update((tasks) => [task, ...tasks]);
        this.totalSignal.update((total) => total + 1);
        this.notificationService.success('Tarea creada.');
      },
      'No se pudo crear la tarea.',
    );
  }

  updateTask(id: string, payload: UpdateTaskPayload): void {
    void this.runRequest(
      async () => {
        const updated = await this.updateTaskUseCase.execute(id, payload);
        this.replaceTask(updated);
        this.notificationService.success('Tarea actualizada.');
      },
      'No se pudo actualizar la tarea.',
    );
  }

  deleteTask(id: string): void {
    void this.runRequest(
      async () => {
        await this.deleteTaskUseCase.execute(id);
        this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
        this.totalSignal.update((total) => Math.max(0, total - 1));
        this.notificationService.success('Tarea eliminada.');
      },
      'No se pudo eliminar la tarea.',
    );
  }

  changeTaskStatus(task: Task, status: TaskStatus): void {
    void this.runRequest(
      async () => {
        const updated = await this.changeTaskStatusUseCase.execute(task, status);
        this.replaceTask(updated);
        this.notificationService.success('Tarea actualizada.');
      },
      'No se pudo actualizar la tarea.',
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  setStatusFilter(status: TaskStatus | 'all'): void {
    this.statusFilterSignal.set(status);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private async runLoadMoreRequest(): Promise<void> {
    const nextPage = this.currentPageSignal() + 1;
    this.loadingMoreSignal.set(true);
    this.errorSignal.set(null);

    try {
      await this.delay(LOAD_MORE_DELAY_MS);
      const result = await this.listTasksPageUseCase.execute({ page: nextPage, limit: PAGE_SIZE });
      const newData = result.data ?? [];

      this.tasksSignal.update((tasks) => [...tasks, ...newData]);
      this.hasMoreSignal.set(result.hasMore ?? false);
      this.totalSignal.set(result.total ?? this.totalSignal());
      this.currentPageSignal.set(nextPage);
    } catch {
      const message = 'No se pudieron cargar mas tareas.';
      this.errorSignal.set(message);
      this.notificationService.error(message);
    } finally {
      this.loadingMoreSignal.set(false);
    }
  }

  private async runRequest(request: () => Promise<void>, errorMessage: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      await request();
    } catch {
      this.errorSignal.set(errorMessage);
      this.notificationService.error(errorMessage);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private replaceTask(updatedTask: Task): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
