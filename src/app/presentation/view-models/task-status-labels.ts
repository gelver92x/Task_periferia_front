import { TaskStatus } from '../../domain/enums/task-status.enum';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'Pendiente',
  [TaskStatus.InProgress]: 'En progreso',
  [TaskStatus.Done]: 'Completado',
};
