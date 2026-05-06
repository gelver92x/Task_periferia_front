import { TaskStatus } from '../enums/task-status.enum';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../models/task.model';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export class TaskEntity {
  private constructor(private readonly props: Task) {}

  static rehydrate(task: Task): TaskEntity {
    this.assertValidTitle(task.title);
    this.assertValidDescription(task.description);

    return new TaskEntity({ ...task });
  }

  static prepareCreate(payload: CreateTaskPayload): CreateTaskPayload {
    const title = payload.title.trim();
    const description = payload.description?.trim();

    this.assertValidTitle(title);
    this.assertValidDescription(description ?? '');

    return {
      title,
      description,
      status: payload.status ?? TaskStatus.Pending,
    };
  }

  static prepareUpdate(payload: UpdateTaskPayload): UpdateTaskPayload {
    const update: UpdateTaskPayload = {};

    if (payload.title !== undefined) {
      const title = payload.title.trim();
      this.assertValidTitle(title);
      update.title = title;
    }

    if (payload.description !== undefined) {
      const description = payload.description.trim();
      this.assertValidDescription(description);
      update.description = description;
    }

    if (payload.status !== undefined) {
      update.status = payload.status;
    }

    return update;
  }

  changeStatus(status: TaskStatus): TaskEntity {
    return new TaskEntity({
      ...this.props,
      status,
    });
  }

  toPrimitives(): Task {
    return { ...this.props };
  }

  private static assertValidTitle(title: string): void {
    if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
      throw new Error(`Task title must contain between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`);
    }
  }

  private static assertValidDescription(description: string): void {
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`Task description must contain ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
    }
  }
}
