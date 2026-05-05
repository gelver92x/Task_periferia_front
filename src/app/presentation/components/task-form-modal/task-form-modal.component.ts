import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../../domain/models/task.model';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-modal.component.html',
  styleUrl: './task-form-modal.component.scss',
})
export class TaskFormModalComponent {
  readonly open = input(false);
  readonly task = input<Task | null>(null);
  readonly saved = output<CreateTaskPayload | UpdateTaskPayload>();
  readonly cancelled = output<void>();

  protected readonly statuses = Object.values(TaskStatus);
  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    status: new FormControl<TaskStatus>(TaskStatus.Pending, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      const task = this.task();

      this.form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? TaskStatus.Pending,
      });
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.emit(this.form.getRawValue());
  }
}
