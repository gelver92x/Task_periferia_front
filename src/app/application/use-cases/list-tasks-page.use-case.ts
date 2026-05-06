import { PagedTaskResult, TaskRepositoryPort } from '../ports/task-repository.port';

export type ListTasksPageInput = {
  page: number;
  limit: number;
};

export class ListTasksPageUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  execute(input: ListTasksPageInput): Promise<PagedTaskResult> {
    if (!Number.isInteger(input.page) || input.page < 1) {
      throw new Error('Page must be a positive integer.');
    }

    if (!Number.isInteger(input.limit) || input.limit < 1) {
      throw new Error('Limit must be a positive integer.');
    }

    return this.taskRepository.findPaginated(input.page, input.limit);
  }
}
