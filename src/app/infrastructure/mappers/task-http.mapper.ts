import { TaskEntity } from '../../domain/entities/task.entity';
import { CreateTaskRepositoryInput, PagedTaskResult } from '../../application/ports/task-repository.port';
import {
  CreateTaskRequestDto,
  PagedTasksApiResponseDto,
  TaskApiDto,
  UpdateTaskRequestDto,
} from '../dto/task-api.dto';

export class TaskHttpMapper {
  static toDomain(dto: TaskApiDto): TaskEntity {
    return TaskEntity.rehydrate({
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }

  static toPagedResult(dto: PagedTasksApiResponseDto): PagedTaskResult {
    return {
      data: dto.data.map((task) => this.toDomain(task)),
      total: dto.total,
      page: dto.page,
      limit: dto.limit,
      hasMore: dto.hasMore,
    };
  }

  static toCreateRequest(input: CreateTaskRepositoryInput): CreateTaskRequestDto {
    return {
      title: input.title,
      description: input.description,
      status: input.status,
    };
  }

  static toUpdateRequest(task: TaskEntity): UpdateTaskRequestDto {
    const primitives = task.toPrimitives();

    return {
      title: primitives.title,
      description: primitives.description,
      status: primitives.status,
    };
  }
}
