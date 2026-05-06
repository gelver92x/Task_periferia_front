import { TaskEntity } from '../../domain/entities/task.entity';
import { CreateTaskPayload, Task } from '../../domain/models/task.model';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(payload: CreateTaskPayload): Promise<Task> {
    const validPayload = TaskEntity.prepareCreate(payload);
    const createdTask = await this.taskRepository.create(validPayload);

    return TaskEntity.rehydrate(createdTask).toPrimitives();
  }
}
