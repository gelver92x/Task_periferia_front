import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ChangeTaskStatusUseCase } from './application/use-cases/change-task-status.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { ListTasksPageUseCase } from './application/use-cases/list-tasks-page.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { routes } from './app.routes';
import { TASK_REPOSITORY } from './infrastructure/composition/task-repository.token';
import { TaskHttpRepository } from './infrastructure/repositories/task-http.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: TASK_REPOSITORY,
      useClass: TaskHttpRepository,
    },
    {
      provide: ListTasksPageUseCase,
      useFactory: () => new ListTasksPageUseCase(inject(TASK_REPOSITORY)),
    },
    {
      provide: CreateTaskUseCase,
      useFactory: () => new CreateTaskUseCase(inject(TASK_REPOSITORY)),
    },
    {
      provide: UpdateTaskUseCase,
      useFactory: () => new UpdateTaskUseCase(inject(TASK_REPOSITORY)),
    },
    {
      provide: DeleteTaskUseCase,
      useFactory: () => new DeleteTaskUseCase(inject(TASK_REPOSITORY)),
    },
    {
      provide: ChangeTaskStatusUseCase,
      useFactory: () => new ChangeTaskStatusUseCase(inject(TASK_REPOSITORY)),
    },
  ],
};
