import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../api/auth.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, AvatarComponent],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class NavBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  readonly currentUser = this.auth.currentUser;
  readonly isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    this.isOpen.set(false);
    void this.router.navigate(['/login']);
  }
}
