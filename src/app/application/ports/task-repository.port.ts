import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';

export interface TaskStats {
  pending:    number;
  inProgress: number;
  done:       number;
}

export interface PagedTaskResult {
  data:    TaskEntity[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
  stats:   TaskStats;
}

export type CreateTaskRepositoryInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export interface TaskRepositoryPort {
  findPaginated(page: number, limit: number, status?: TaskStatus): Promise<PagedTaskResult>;
  findById(id: string): Promise<TaskEntity | null>;
  create(input: CreateTaskRepositoryInput): Promise<TaskEntity>;
  update(task: TaskEntity): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
}
