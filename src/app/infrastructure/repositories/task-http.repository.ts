import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PagedTaskResult, TaskRepositoryPort } from '../../application/ports/task-repository.port';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class TaskHttpRepository implements TaskRepositoryPort {
  private readonly endpoint = `${environment.apiUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  findPaginated(page: number, limit: number): Promise<PagedTaskResult> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());
    return firstValueFrom(this.http.get<PagedTaskResult>(this.endpoint, { params }));
  }

  findById(id: string): Promise<Task> {
    return firstValueFrom(this.http.get<Task>(`${this.endpoint}/${id}`));
  }

  create(payload: CreateTaskPayload): Promise<Task> {
    return firstValueFrom(this.http.post<Task>(this.endpoint, payload));
  }

  update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    return firstValueFrom(this.http.put<Task>(`${this.endpoint}/${id}`, payload));
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.endpoint}/${id}`));
  }
}
