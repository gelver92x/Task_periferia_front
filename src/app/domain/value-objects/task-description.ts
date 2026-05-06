import { DomainError } from '../errors/domain-error';

const MAX_DESCRIPTION_LENGTH = 500;

export class TaskDescription {
  private constructor(readonly value: string) {}

  static create(value: string | undefined): TaskDescription {
    const normalized = value?.trim() ?? '';

    if (normalized.length > MAX_DESCRIPTION_LENGTH) {
      throw new DomainError(`Task description must contain ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
    }

    return new TaskDescription(normalized);
  }
}
