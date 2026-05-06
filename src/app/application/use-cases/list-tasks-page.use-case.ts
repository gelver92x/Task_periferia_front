import { PagedTaskResult, TaskRepositoryPort } from '../ports/task-repository.port';
import { ListTasksPageQuery, PagedTasksResult } from '../models/task-use-case.models';

export class ListTasksPageUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(input: ListTasksPageQuery): Promise<PagedTasksResult> {
    if (!Number.isInteger(input.page) || input.page < 1) {
      throw new Error('Page must be a positive integer.');
    }

    if (!Number.isInteger(input.limit) || input.limit < 1) {
      throw new Error('Limit must be a positive integer.');
    }

    const result: PagedTaskResult = await this.taskRepository.findPaginated(input.page, input.limit);

    return {
      ...result,
      data: result.data.map((task) => task.toPrimitives()),
    };
  }
}
