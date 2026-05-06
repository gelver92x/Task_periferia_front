import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskHttpMapper } from './task-http.mapper';

describe('TaskHttpMapper', () => {
  it('maps API task DTOs to domain entities', () => {
    const task = TaskHttpMapper.toDomain({
      id: 'task-1',
      title: 'Valid task',
      description: 'Mapped from API',
      status: TaskStatus.InProgress,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(task.toPrimitives()).toEqual({
      id: 'task-1',
      title: 'Valid task',
      description: 'Mapped from API',
      status: TaskStatus.InProgress,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
