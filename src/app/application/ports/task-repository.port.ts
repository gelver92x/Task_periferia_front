import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/models/task.model';

export interface PagedTaskResult {
  data:    Task[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
}

export interface TaskRepositoryPort {
  findPaginated(page: number, limit: number): Promise<PagedTaskResult>;
  findById(id: string): Promise<Task>;
  create(payload: CreateTaskPayload): Promise<Task>;
  update(id: string, payload: UpdateTaskPayload): Promise<Task>;
  delete(id: string): Promise<void>;
}
