import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { delay, finalize, Observable } from 'rxjs';

import { TASK_REPOSITORY } from '../ports/task-repository.port';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';
import { NotificationService } from '../../shared/services/notification.service';

const PAGE_SIZE = 9;

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  private readonly taskRepository   = inject(TASK_REPOSITORY);
  private readonly notificationService = inject(NotificationService);

  // ── Estado de datos ──────────────────────────────────────────────
  private readonly tasksSignal        = signal<Task[]>([]);
  private readonly loadingSignal      = signal(false);       // carga inicial
  private readonly loadingMoreSignal  = signal(false);       // paginación
  private readonly errorSignal        = signal<string | null>(null);
  private readonly searchQuerySignal  = signal('');
  private readonly statusFilterSignal = signal<TaskStatus | 'all'>('all');

  // ── Estado de paginación ─────────────────────────────────────────
  private readonly currentPageSignal  = signal(1);
  private readonly hasMoreSignal      = signal(true);
  private readonly totalSignal        = signal(0);

  // ── Superficie pública (solo lectura) ────────────────────────────
  readonly tasks       = this.tasksSignal.asReadonly();
  readonly loading     = this.loadingSignal.asReadonly();
  readonly loadingMore = this.loadingMoreSignal.asReadonly();
  readonly error       = this.errorSignal.asReadonly();
  readonly hasMore     = this.hasMoreSignal.asReadonly();
  readonly totalAll    = this.totalSignal.asReadonly();
  readonly statusFilter = this.statusFilterSignal.asReadonly();

  // ── Computed: filtrado client-side sobre las tareas ya cargadas ──
  readonly filteredTasks = computed(() => {
    const query  = this.searchQuerySignal().trim().toLowerCase();
    const status = this.statusFilterSignal();
    let list     = this.tasksSignal();

    if (status !== 'all') list = list.filter((t) => t.status === status);
    if (!query) return list;
    return list.filter((t) =>
      `${t.title} ${t.description ?? ''} ${t.status}`.toLowerCase().includes(query)
    );
  });

  readonly totalTasks = computed(() => this.totalSignal());
  readonly pendingTasks = computed(
    () => this.tasksSignal().filter((t) => t.status === TaskStatus.Pending).length
  );
  readonly inProgressTasks = computed(
    () => this.tasksSignal().filter((t) => t.status === TaskStatus.InProgress).length
  );
  readonly doneTasks = computed(
    () => this.tasksSignal().filter((t) => t.status === TaskStatus.Done).length
  );

  readonly tasks$   = toObservable(this.tasksSignal);
  readonly loading$ = toObservable(this.loadingSignal);

  // ── Carga inicial (página 1) con delay de 5 s para el skeleton ───
  loadTasks(): void {
    this.currentPageSignal.set(1);
    this.hasMoreSignal.set(true);
    this.tasksSignal.set([]);

    this.runRequest(
      this.taskRepository.findPaginated(1, PAGE_SIZE).pipe(delay(5000)),
      {
        success: (result) => {
          this.tasksSignal.set(result.data);
          this.hasMoreSignal.set(result.hasMore);
          this.totalSignal.set(result.total);
          this.currentPageSignal.set(1);
        },
        errorMessage: 'No se pudieron cargar las tareas.',
        isLoadMore: false,
      }
    );
  }

  // ── Carga siguiente página con delay de 3 s ──────────────────────
  loadMoreTasks(): void {
    if (this.loadingMoreSignal() || !this.hasMoreSignal()) return;

    const nextPage = this.currentPageSignal() + 1;
    this.loadingMoreSignal.set(true);

    this.taskRepository
      .findPaginated(nextPage, PAGE_SIZE)
      .pipe(
        delay(3000),
        finalize(() => this.loadingMoreSignal.set(false))
      )
      .subscribe({
        next: (result) => {
          this.tasksSignal.update((existing) => [...existing, ...result.data]);
          this.hasMoreSignal.set(result.hasMore);
          this.totalSignal.set(result.total);
          this.currentPageSignal.set(nextPage);
        },
        error: () => {
          const msg = 'No se pudieron cargar más tareas.';
          this.errorSignal.set(msg);
          this.notificationService.error(msg);
        },
      });
  }

  createTask(payload: CreateTaskPayload): void {
    this.runRequest(this.taskRepository.create(payload), {
      success: (task) => {
        this.tasksSignal.update((tasks) => [task, ...tasks]);
        this.totalSignal.update((n) => n + 1);
        this.notificationService.success('Tarea creada.');
      },
      errorMessage: 'No se pudo crear la tarea.',
    });
  }

  updateTask(id: string, payload: UpdateTaskPayload): void {
    this.runRequest(this.taskRepository.update(id, payload), {
      success: (updated) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((t) => (t.id === updated.id ? updated : t))
        );
        this.notificationService.success('Tarea actualizada.');
      },
      errorMessage: 'No se pudo actualizar la tarea.',
    });
  }

  deleteTask(id: string): void {
    this.runRequest(this.taskRepository.delete(id), {
      success: () => {
        this.tasksSignal.update((tasks) => tasks.filter((t) => t.id !== id));
        this.totalSignal.update((n) => Math.max(0, n - 1));
        this.notificationService.success('Tarea eliminada.');
      },
      errorMessage: 'No se pudo eliminar la tarea.',
    });
  }

  changeTaskStatus(task: Task, status: TaskStatus): void {
    this.updateTask(task.id, { status });
  }

  setSearchQuery(query: string): void { this.searchQuerySignal.set(query); }
  setStatusFilter(status: TaskStatus | 'all'): void { this.statusFilterSignal.set(status); }
  clearError(): void { this.errorSignal.set(null); }

  private runRequest<T>(
    request$: Observable<T>,
    handlers: { success: (value: T) => void; errorMessage: string; isLoadMore?: boolean }
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
