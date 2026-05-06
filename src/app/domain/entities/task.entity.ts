import { TaskStatus } from '../enums/task-status.enum';
import { TaskPrimitives } from '../models/task.model';
import { TaskDescription } from '../value-objects/task-description';
import { TaskId } from '../value-objects/task-id';
import { TaskTitle } from '../value-objects/task-title';

export class TaskEntity {
  private constructor(
    readonly id: TaskId,
    readonly title: TaskTitle,
    readonly description: TaskDescription,
    readonly status: TaskStatus,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  static rehydrate(task: TaskPrimitives): TaskEntity {
    return new TaskEntity(
      TaskId.create(task.id),
      TaskTitle.create(task.title),
      TaskDescription.create(task.description),
      task.status,
      task.createdAt,
      task.updatedAt,
    );
  }

  static prepareCreation(input: {
    title: string;
    description?: string;
    status?: TaskStatus;
  }): { title: string; description: string; status: TaskStatus } {
    return {
      title: TaskTitle.create(input.title).value,
      description: TaskDescription.create(input.description).value,
      status: input.status ?? TaskStatus.Pending,
    };
  }

  rename(title: string): TaskEntity {
    return new TaskEntity(
      this.id,
      TaskTitle.create(title),
      this.description,
      this.status,
      this.createdAt,
      this.updatedAt,
    );
  }

  updateDescription(description: string | undefined): TaskEntity {
    return new TaskEntity(
      this.id,
      this.title,
      TaskDescription.create(description),
      this.status,
      this.createdAt,
      this.updatedAt,
    );
  }

  changeStatus(status: TaskStatus): TaskEntity {
    return new TaskEntity(
      this.id,
      this.title,
      this.description,
      status,
      this.createdAt,
      this.updatedAt,
    );
  }

  toPrimitives(): TaskPrimitives {
    return {
      id: this.id.value,
      title: this.title.value,
      description: this.description.value,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
