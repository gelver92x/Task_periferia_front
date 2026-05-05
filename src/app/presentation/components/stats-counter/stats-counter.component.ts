import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-counter',
  standalone: true,
  imports: [],
  templateUrl: './stats-counter.component.html',
  styleUrl: './stats-counter.component.scss',
})
export class StatsCounterComponent {
  readonly total = input.required<number>();
  readonly pending = input.required<number>();
  readonly inProgress = input.required<number>();
  readonly done = input.required<number>();
}
