import { TaskStatus } from '../../domain/enums/task-status.enum';

export type TaskApiDto = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatsApiDto = {
  pending:    number;
  inProgress: number;
  done:       number;
};

export type PagedTasksApiResponseDto = {
  data:    TaskApiDto[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
  stats:   TaskStatsApiDto;
};

export type CreateTaskRequestDto = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type UpdateTaskRequestDto = {
  title: string;
  description: string;
  status: TaskStatus;
};
