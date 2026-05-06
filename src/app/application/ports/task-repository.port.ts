import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';

export interface PagedTaskResult {
  data:    Task[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
}

export interface TaskRepositoryPort {
  findPaginated(page: number, limit: number): Observable<PagedTaskResult>;
  findById(id: string): Observable<Task>;
  create(payload: CreateTaskPayload): Observable<Task>;
  update(id: string, payload: UpdateTaskPayload): Observable<Task>;
  delete(id: string): Observable<void>;
}

export const TASK_REPOSITORY = new InjectionToken<TaskRepositoryPort>('TASK_REPOSITORY');

