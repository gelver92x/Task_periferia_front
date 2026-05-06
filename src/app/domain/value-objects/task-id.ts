import { DomainError } from '../errors/domain-error';

export class TaskId {
  private constructor(readonly value: string) {}

  static create(value: string): TaskId {
    const normalized = value.trim();

    if (!normalized) {
      throw new DomainError('Task id is required.');
    }

    return new TaskId(normalized);
  }
}
