import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  input,
  output,
  viewChild,
} from '@angular/core';

import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { Task } from '../../../domain/models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements AfterViewInit, OnDestroy {
  // ── Inputs ────────────────────────────────────────────────────────
  readonly tasks       = input.required<Task[]>();
  readonly loading     = input(false);    // carga inicial → muestra skeleton grid
  readonly loadingMore = input(false);    // carga de página siguiente
  readonly hasMore     = input(false);    // hay más páginas disponibles

  // ── Outputs ───────────────────────────────────────────────────────
  readonly edit         = output<Task>();
  readonly delete       = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();
  readonly loadMore     = output<void>(); // IntersectionObserver lo dispara

  // ── Sentinel para IntersectionObserver ────────────────────────────
  readonly sentinelRef = viewChild<ElementRef<HTMLDivElement>>('sentinel');

  /** 9 slots para la cuadrícula skeleton 3×3 */
  protected readonly skeletons = Array(9).fill(null);

  private observer: IntersectionObserver | null = null;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupObserver(): void {
    const el = this.sentinelRef()?.nativeElement;
    if (!el) return;

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !this.loadingMore() && !this.loading()) {
            this.zone.run(() => this.loadMore.emit());
          }
        },
        { rootMargin: '120px' } // dispara 120px antes del final
      );
      this.observer.observe(el);
    });
  }
}
