import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  readonly id: number;
  readonly text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<readonly ToastMessage[]>([]);

  show(text: string, durationMs = 2500): void {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, text }]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, durationMs);
  }
}
