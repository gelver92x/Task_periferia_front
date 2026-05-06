import { DeleteTaskCommand } from '../models/task-use-case.models';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  execute(command: DeleteTaskCommand): Promise<void> {
    if (!command.taskId.trim()) {
      throw new Error('Task id is required.');
    }

    return this.taskRepository.delete(command.taskId);
  }
}
