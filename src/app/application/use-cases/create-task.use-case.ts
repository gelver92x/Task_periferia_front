import { TaskEntity } from '../../domain/entities/task.entity';
import { CreateTaskCommand, TaskResult } from '../models/task-use-case.models';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(command: CreateTaskCommand): Promise<TaskResult> {
    const validInput = TaskEntity.prepareCreation(command);
    const createdTask = await this.taskRepository.create(validInput);

    return createdTask.toPrimitives();
  }
}
