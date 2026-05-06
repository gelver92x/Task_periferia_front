import { TaskEntity } from '../../domain/entities/task.entity';
import { Task, UpdateTaskPayload } from '../../domain/models/task.model';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string, payload: UpdateTaskPayload): Promise<Task> {
    if (!id.trim()) {
      throw new Error('Task id is required.');
    }

    const validPayload = TaskEntity.prepareUpdate(payload);
    const updatedTask = await this.taskRepository.update(id, validPayload);

    return TaskEntity.rehydrate(updatedTask).toPrimitives();
  }
}
