export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Done = 'done',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'Pending',
  [TaskStatus.InProgress]: 'In progress',
  [TaskStatus.Done]: 'Done',
};

