import { computed, inject, Injectable, signal } from '@angular/core';

import { ChangeTaskStatusUseCase } from '../../application/use-cases/change-task-status.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { ListTasksPageUseCase } from '../../application/use-cases/list-tasks-page.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { NotificationService } from '../../shared/services/notification.service';
import { TaskFormValue, TaskViewModel } from '../view-models/task.view-model';
import { TaskStatsResult } from '../../application/models/task-use-case.models';

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

  private readonly tasksSignal = signal<TaskViewModel[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly loadingMoreSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchQuerySignal = signal('');
  private readonly statusFilterSignal = signal<TaskStatus | 'all'>('all');

  private readonly currentPageSignal = signal(1);
  private readonly hasMoreSignal = signal(true);
  private readonly totalSignal = signal(0);
  private readonly statsSignal = signal<TaskStatsResult>({ pending: 0, inProgress: 0, done: 0 });

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loadingMore = this.loadingMoreSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly hasMore = this.hasMoreSignal.asReadonly();
  readonly totalAll = this.totalSignal.asReadonly();
  readonly statusFilter = this.statusFilterSignal.asReadonly();

  readonly filteredTasks = computed(() => {
    const query = this.searchQuerySignal().trim().toLowerCase();
    const list = this.tasksSignal();

    if (!query) {
      return list;
    }

    return list.filter((task) =>
      `${task.title} ${task.description ?? ''} ${task.status}`.toLowerCase().includes(query),
    );
  });

  readonly totalTasks = computed(() => this.totalSignal());
  readonly pendingTasks = computed(() => this.statsSignal().pending);
  readonly inProgressTasks = computed(() => this.statsSignal().inProgress);
  readonly doneTasks = computed(() => this.statsSignal().done);

  loadTasks(): void {
    this.currentPageSignal.set(1);
    this.hasMoreSignal.set(true);
    this.tasksSignal.set([]);

    void this.runRequest(
      async () => {
        await this.delay(INITIAL_LOADING_DELAY_MS);
        const filter = this.statusFilterSignal();
        const result = await this.listTasksPageUseCase.execute({ 
          page: 1, 
          limit: PAGE_SIZE,
          status: filter === 'all' ? undefined : filter
        });

        this.tasksSignal.set(result.data ?? []);
        this.hasMoreSignal.set(result.hasMore ?? false);
        this.totalSignal.set(result.total ?? result.data?.length ?? 0);
        if (result.stats) {
          this.statsSignal.set(result.stats);
        }
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

  createTask(formValue: TaskFormValue): void {
    void this.runRequest(
      async () => {
        const task = await this.createTaskUseCase.execute(formValue);
        const filter = this.statusFilterSignal();
        
        if (filter === 'all' || filter === task.status) {
          this.tasksSignal.update((tasks) => [task, ...tasks]);
        }
        
        this.totalSignal.update((total) => total + 1);
        this.incrementStat(task.status, 1);
        this.notificationService.success('Tarea creada.');
      },
      'No se pudo crear la tarea.',
    );
  }

  updateTask(id: string, formValue: TaskFormValue): void {
    const oldTask = this.tasksSignal().find(t => t.id === id);
    const oldStatus = oldTask?.status;

    void this.runRequest(
      async () => {
        const updated = await this.updateTaskUseCase.execute({ id, ...formValue });
        
        if (oldStatus && oldStatus !== updated.status) {
          this.incrementStat(oldStatus, -1);
          this.incrementStat(updated.status, 1);
        }

        const filter = this.statusFilterSignal();
        if (filter !== 'all' && filter !== updated.status) {
          this.tasksSignal.update((tasks) => tasks.filter(t => t.id !== id));
        } else {
          this.replaceTask(updated);
        }
        
        this.notificationService.success('Tarea actualizada.');
      },
      'No se pudo actualizar la tarea.',
    );
  }

  deleteTask(id: string): void {
    const taskToDelete = this.tasksSignal().find(t => t.id === id);
    
    void this.runRequest(
      async () => {
        await this.deleteTaskUseCase.execute({ taskId: id });
        this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
        this.totalSignal.update((total) => Math.max(0, total - 1));
        if (taskToDelete) {
          this.incrementStat(taskToDelete.status, -1);
        }
        this.notificationService.success('Tarea eliminada.');
      },
      'No se pudo eliminar la tarea.',
    );
  }

  changeTaskStatus(task: TaskViewModel, status: TaskStatus): void {
    void this.runRequest(
      async () => {
        const updated = await this.changeTaskStatusUseCase.execute({ taskId: task.id, status });
        
        if (task.status !== updated.status) {
          this.incrementStat(task.status, -1);
          this.incrementStat(updated.status, 1);
        }

        const filter = this.statusFilterSignal();
        if (filter !== 'all' && filter !== updated.status) {
          this.tasksSignal.update((tasks) => tasks.filter(t => t.id !== task.id));
        } else {
          this.replaceTask(updated);
        }
        
        this.notificationService.success('Tarea actualizada.');
      },
      'No se pudo actualizar la tarea.',
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  setStatusFilter(status: TaskStatus | 'all'): void {
    if (this.statusFilterSignal() !== status) {
      this.statusFilterSignal.set(status);
      this.loadTasks(); // Reload from backend with new filter
    }
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
      const filter = this.statusFilterSignal();
      const result = await this.listTasksPageUseCase.execute({ 
        page: nextPage, 
        limit: PAGE_SIZE,
        status: filter === 'all' ? undefined : filter
      });
      const newData = result.data ?? [];

      this.tasksSignal.update((tasks) => [...tasks, ...newData]);
      this.hasMoreSignal.set(result.hasMore ?? false);
      this.totalSignal.set(result.total ?? this.totalSignal());
      if (result.stats) {
        this.statsSignal.set(result.stats);
      }
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

  private replaceTask(updatedTask: TaskViewModel): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  }

  private incrementStat(status: TaskStatus, amount: number): void {
    this.statsSignal.update(stats => {
      const newStats = { ...stats };
      if (status === TaskStatus.Pending) newStats.pending = Math.max(0, newStats.pending + amount);
      if (status === TaskStatus.InProgress) newStats.inProgress = Math.max(0, newStats.inProgress + amount);
      if (status === TaskStatus.Done) newStats.done = Math.max(0, newStats.done + amount);
      return newStats;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
