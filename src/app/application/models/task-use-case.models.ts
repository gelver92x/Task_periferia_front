import { TaskStatus } from '../../domain/enums/task-status.enum';

export type TaskResult = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type PagedTasksResult = {
  data: TaskResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type CreateTaskCommand = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

export type UpdateTaskCommand = {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export type ChangeTaskStatusCommand = {
  taskId: string;
  status: TaskStatus;
};

export type DeleteTaskCommand = {
  taskId: string;
};

export type ListTasksPageQuery = {
  page: number;
  limit: number;
};
