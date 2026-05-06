import { InjectionToken } from '@angular/core';

import { TaskRepositoryPort } from '../../application/ports/task-repository.port';

export const TASK_REPOSITORY = new InjectionToken<TaskRepositoryPort>('TASK_REPOSITORY');
