import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';

export interface PagedTaskResult {
  data:    TaskEntity[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
}

export type CreateTaskRepositoryInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export interface TaskRepositoryPort {
  findPaginated(page: number, limit: number): Promise<PagedTaskResult>;
  findById(id: string): Promise<TaskEntity | null>;
  create(input: CreateTaskRepositoryInput): Promise<TaskEntity>;
  update(task: TaskEntity): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
}
