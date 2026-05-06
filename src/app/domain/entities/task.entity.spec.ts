import { DomainError } from '../errors/domain-error';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskEntity } from './task.entity';

describe('TaskEntity', () => {
  it('validates title length when preparing a task creation', () => {
    expect(() => TaskEntity.prepareCreation({ title: 'ab' })).toThrowError(DomainError);
  });

  it('validates description length when preparing a task creation', () => {
    expect(() =>
      TaskEntity.prepareCreation({
        title: 'Valid task',
        description: 'x'.repeat(501),
      }),
    ).toThrowError(DomainError);
  });

  it('changes status without mutating the original task', () => {
    const task = TaskEntity.rehydrate({
      id: 'task-1',
      title: 'Valid task',
      description: 'Initial description',
      status: TaskStatus.Pending,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const changedTask = task.changeStatus(TaskStatus.Done);

    expect(task.toPrimitives().status).toBe(TaskStatus.Pending);
    expect(changedTask.toPrimitives().status).toBe(TaskStatus.Done);
  });
});
