import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { CreateTaskRepositoryInput, PagedTaskResult, TaskRepositoryPort } from '../ports/task-repository.port';
import { ChangeTaskStatusUseCase } from './change-task-status.use-case';

class FakeTaskRepository implements TaskRepositoryPort {
  updatedTask: TaskEntity | null = null;

  constructor(private readonly task: TaskEntity | null) {}

  findPaginated(): Promise<PagedTaskResult> {
    return Promise.resolve({ data: [], total: 0, page: 1, limit: 9, hasMore: false });
  }

  findById(): Promise<TaskEntity | null> {
    return Promise.resolve(this.task);
  }

  create(input: CreateTaskRepositoryInput): Promise<TaskEntity> {
    return Promise.resolve(
      TaskEntity.rehydrate({
        id: 'created-task',
        title: input.title,
        description: input.description,
        status: input.status,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    );
  }

  update(task: TaskEntity): Promise<TaskEntity> {
    this.updatedTask = task;
    return Promise.resolve(task);
  }

  delete(): Promise<void> {
    return Promise.resolve();
  }
}

describe('ChangeTaskStatusUseCase', () => {
  it('loads the task by id, changes its status and persists it', async () => {
    const task = TaskEntity.rehydrate({
      id: 'task-1',
      title: 'Valid task',
      description: '',
      status: TaskStatus.Pending,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const repository = new FakeTaskRepository(task);
    const useCase = new ChangeTaskStatusUseCase(repository);

    const result = await useCase.execute({ taskId: 'task-1', status: TaskStatus.Done });

    expect(result.status).toBe(TaskStatus.Done);
    expect(repository.updatedTask?.toPrimitives().status).toBe(TaskStatus.Done);
  });

  it('fails when the task does not exist', async () => {
    const useCase = new ChangeTaskStatusUseCase(new FakeTaskRepository(null));

    await expectAsync(useCase.execute({ taskId: 'missing-task', status: TaskStatus.Done })).toBeRejectedWithError(
      'Task not found.',
    );
  });
});
