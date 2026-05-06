import { TaskRepositoryPort } from '../ports/task-repository.port';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  execute(id: string): Promise<void> {
    if (!id.trim()) {
      throw new Error('Task id is required.');
    }

    return this.taskRepository.delete(id);
  }
}
