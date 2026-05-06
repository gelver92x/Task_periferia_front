import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CreateTaskRepositoryInput, PagedTaskResult, TaskRepositoryPort } from '../../application/ports/task-repository.port';
import { TaskEntity } from '../../domain/entities/task.entity';
import { environment } from '../../../environments/environment';
import { PagedTasksApiResponseDto, TaskApiDto } from '../dto/task-api.dto';
import { TaskHttpMapper } from '../mappers/task-http.mapper';

@Injectable()
export class TaskHttpRepository implements TaskRepositoryPort {
  private readonly endpoint = `${environment.apiUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  findPaginated(page: number, limit: number): Promise<PagedTaskResult> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    return firstValueFrom(this.http.get<PagedTasksApiResponseDto>(this.endpoint, { params })).then((response) =>
      TaskHttpMapper.toPagedResult(response),
    );
  }

  findById(id: string): Promise<TaskEntity | null> {
    return firstValueFrom(this.http.get<TaskApiDto>(`${this.endpoint}/${id}`)).then((response) =>
      TaskHttpMapper.toDomain(response),
    );
  }

  create(input: CreateTaskRepositoryInput): Promise<TaskEntity> {
    return firstValueFrom(
      this.http.post<TaskApiDto>(this.endpoint, TaskHttpMapper.toCreateRequest(input)),
    ).then((response) => TaskHttpMapper.toDomain(response));
  }

  update(task: TaskEntity): Promise<TaskEntity> {
    const primitives = task.toPrimitives();

    return firstValueFrom(
      this.http.put<TaskApiDto>(`${this.endpoint}/${primitives.id}`, TaskHttpMapper.toUpdateRequest(task)),
    ).then((response) => TaskHttpMapper.toDomain(response));
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.endpoint}/${id}`));
  }
}
