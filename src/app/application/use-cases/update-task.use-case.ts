import { UpdateTaskCommand, TaskResult } from '../models/task-use-case.models';
import { TaskRepositoryPort } from '../ports/task-repository.port';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(command: UpdateTaskCommand): Promise<TaskResult> {
    if (!command.id.trim()) {
      throw new Error('Task id is required.');
    }

    const existingTask = await this.taskRepository.findById(command.id);

    if (!existingTask) {
      throw new Error('Task not found.');
    }

    let taskToUpdate = existingTask;

    if (command.title !== undefined) {
      taskToUpdate = taskToUpdate.rename(command.title);
    }

    if (command.description !== undefined) {
      taskToUpdate = taskToUpdate.updateDescription(command.description);
    }

    if (command.status !== undefined) {
      taskToUpdate = taskToUpdate.changeStatus(command.status);
    }

    const updatedTask = await this.taskRepository.update(taskToUpdate);

    return updatedTask.toPrimitives();
  }
}
