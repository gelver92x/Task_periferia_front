import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedTaskResult, TaskRepositoryPort } from '../../application/ports/task-repository.port';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class TaskHttpRepository implements TaskRepositoryPort {
  private readonly endpoint = `${environment.apiUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  findPaginated(page: number, limit: number): Observable<PagedTaskResult> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());
    return this.http.get<PagedTaskResult>(this.endpoint, { params });
  }

  findById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(this.endpoint, payload);
  }

  update(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
