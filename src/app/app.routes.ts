import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/tasks/tasks.component').then((module) => module.TasksComponent),
  },
];
