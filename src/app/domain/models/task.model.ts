import { TaskStatus } from '../enums/task-status.enum';

export interface TaskPrimitives {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
