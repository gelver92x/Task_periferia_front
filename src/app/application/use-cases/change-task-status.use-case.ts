import { ChangeTaskStatusCommand, TaskResult } from '../models/task-use-case.models';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class ChangeTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(command: ChangeTaskStatusCommand): Promise<TaskResult> {
    const existingTask = await this.taskRepository.findById(command.taskId);

    if (!existingTask) {
      throw new Error('Task not found.');
    }

    const updatedTask = await this.taskRepository.update(existingTask.changeStatus(command.status));

    return updatedTask.toPrimitives();
  }
}
