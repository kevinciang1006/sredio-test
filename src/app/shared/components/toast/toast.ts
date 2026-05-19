import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toastSvc = inject(ToastService);
  readonly toasts = this.toastSvc.toasts;
}
