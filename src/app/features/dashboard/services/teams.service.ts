import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Team } from '../../../core/models/team.model';
import { MOCK_TEAMS_BY_TENANT } from '../mock/teams.mock';
import { TENANTS } from '../../../core/constants/tenants.const';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: string): Observable<readonly Team[]> {
    if (environment.useMocks) {
      const data = MOCK_TEAMS_BY_TENANT[tenantId] ?? MOCK_TEAMS_BY_TENANT[TENANTS[0].id];
      return of(data).pipe(delay(250));
    }
    return this.http.get<readonly Team[]>(`${environment.apiBaseUrl}/tenants/${tenantId}/teams`);
  }
}
