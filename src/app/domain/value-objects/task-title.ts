import { DomainError } from '../errors/domain-error';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;

export class TaskTitle {
  private constructor(readonly value: string) {}

  static create(value: string): TaskTitle {
    const normalized = value.trim();

    if (normalized.length < MIN_TITLE_LENGTH || normalized.length > MAX_TITLE_LENGTH) {
      throw new DomainError(
        `Task title must contain between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`,
      );
    }

    return new TaskTitle(normalized);
  }
}
