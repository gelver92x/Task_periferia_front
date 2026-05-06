import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { Task } from '../../domain/models/task.model';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class ChangeTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(task: Task, status: TaskStatus): Promise<Task> {
    const changedTask = TaskEntity.rehydrate(task).changeStatus(status);
    const updatedTask = await this.taskRepository.update(task.id, {
      status: changedTask.toPrimitives().status,
    });

    return TaskEntity.rehydrate(updatedTask).toPrimitives();
  }
}
