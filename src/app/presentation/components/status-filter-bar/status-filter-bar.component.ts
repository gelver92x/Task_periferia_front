import { Component, input, output } from '@angular/core';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

export type FilterOption = TaskStatus | 'all';

interface Tab {
  label: string;
  value: FilterOption;
}

@Component({
  selector: 'app-status-filter-bar',
  standalone: true,
  templateUrl: './status-filter-bar.component.html',
  styleUrl: './status-filter-bar.component.scss',
})
export class StatusFilterBarComponent {
  readonly activeFilter = input<FilterOption>('all');
  readonly filterChange = output<FilterOption>();

  protected readonly tabs: Tab[] = [
    { label: 'Todos',       value: 'all' },
    { label: 'Pendientes',  value: TaskStatus.Pending },
    { label: 'En progreso', value: TaskStatus.InProgress },
    { label: 'Completadas', value: TaskStatus.Done },
  ];
}
