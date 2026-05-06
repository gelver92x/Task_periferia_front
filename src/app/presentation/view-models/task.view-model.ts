import { TaskStatus } from '../../domain/enums/task-status.enum';

export type TaskViewModel = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskFormValue = {
  title: string;
  description: string;
  status: TaskStatus;
};
