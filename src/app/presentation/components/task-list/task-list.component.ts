import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  inject,
  input,
  output,
} from '@angular/core';

import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskViewModel } from '../../view-models/task.view-model';
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
  readonly tasks       = input.required<TaskViewModel[]>();
  readonly loading     = input(false);
  readonly loadingMore = input(false);
  readonly hasMore     = input(false);

  // ── Outputs ───────────────────────────────────────────────────────
  readonly edit         = output<TaskViewModel>();
  readonly delete       = output<TaskViewModel>();
  readonly statusChange = output<{ task: TaskViewModel; status: TaskStatus }>();
  readonly loadMore     = output<void>();

  /** 9 slots para skeleton 3×3 */
  protected readonly skeletons = Array(9).fill(null);

  private readonly zone = inject(NgZone);
  private scrollHandler: (() => void) | null = null;
  private initialCheckDone = false;   // sólo hacemos el check automático una vez

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const handler = () => this.onWindowScroll();
      window.addEventListener('scroll', handler, { passive: true });
      this.scrollHandler = () => window.removeEventListener('scroll', handler);
    });
  }

  ngOnDestroy(): void {
    this.scrollHandler?.();
  }

  /**
   * Llamado por el facade/page cuando termina la carga inicial.
   * Si los 9 primeros cards NO producen scroll (viewport mayor al contenido),
   * dispara loadMore UNA SOLA VEZ para dar al usuario algo que desplazar.
   */
  checkInitialFit(): void {
    if (this.initialCheckDone) return;
    this.initialCheckDone = true;
    // Pequeño timeout para que el DOM haya pintado las cards
    setTimeout(() => {
      const docH    = document.documentElement.scrollHeight;
      const windowH = window.innerHeight;
      if (docH <= windowH + 50 && this.hasMore() && !this.loadingMore()) {
        this.zone.run(() => this.loadMore.emit());
      }
    }, 300);
  }

  private onWindowScroll(): void {
    if (this.loadingMore() || this.loading() || !this.hasMore()) return;
    const scrollY      = window.scrollY ?? window.pageYOffset;
    const windowH      = window.innerHeight;
    const docH         = document.documentElement.scrollHeight;
    const nearBottom   = scrollY + windowH >= docH - 280;
    if (nearBottom) {
      this.zone.run(() => this.loadMore.emit());
    }
  }
}
