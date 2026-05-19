import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Team } from '../../../core/models/team.model';
import { MOCK_TEAMS } from '../mock/teams.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly Team[]> {
    if (environment.useMocks) {
      return of(MOCK_TEAMS).pipe(delay(250));
    }
    return this.http.get<readonly Team[]>(`${environment.apiBaseUrl}/teams`);
  }
}
