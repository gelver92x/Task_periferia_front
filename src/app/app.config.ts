import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { TASK_REPOSITORY } from './application/ports/task-repository.port';
import { routes } from './app.routes';
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
  ],
};
