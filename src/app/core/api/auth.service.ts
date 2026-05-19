import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AdminUser } from '../models/admin-user.model';
import { MOCK_ADMIN_USER } from '../mock/admin-user.mock';
import { Credentials } from '../../features/login/models/credentials.model';
import { APP_CONSTANTS } from '../constants/app-constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _currentUser = signal<AdminUser | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(credentials: Credentials): Observable<void> {
    if (!credentials.email || credentials.password.length < 4) {
      return throwError(() => new Error('Invalid email or password.'));
    }
    const fakeToken = `mock-token-${Date.now()}`;
    return of(void 0).pipe(
      delay(300),
      tap(() => this.persist(fakeToken, MOCK_ADMIN_USER)),
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER);
  }

  private persist(token: string, user: AdminUser): void {
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }

  private readUser(): AdminUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(APP_CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  }
}
