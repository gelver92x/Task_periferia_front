import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';

export interface TaskRepositoryPort {
  findAll(): Observable<Task[]>;
  findById(id: string): Observable<Task>;
  create(payload: CreateTaskPayload): Observable<Task>;
  update(id: string, payload: UpdateTaskPayload): Observable<Task>;
  delete(id: string): Observable<void>;
}

export const TASK_REPOSITORY = new InjectionToken<TaskRepositoryPort>('TASK_REPOSITORY');

