import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Profile } from '../models/profile.model';
import { MOCK_PROFILE } from '../mock/profile.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  getCurrent(): Observable<Profile> {
    if (environment.useMocks) {
      return of(MOCK_PROFILE).pipe(delay(250));
    }
    return this.http.get<Profile>(`${environment.apiBaseUrl}/me`);
  }
}
