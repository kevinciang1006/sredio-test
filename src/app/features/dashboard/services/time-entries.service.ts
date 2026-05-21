import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TimeEntry } from '../models/time-entry.model';
import { MOCK_TIME_ENTRIES_BY_TENANT } from '../mock/time-entries.mock';
import { TENANTS } from '../../../core/constants/tenants.const';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimeEntriesService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: string): Observable<readonly TimeEntry[]> {
    if (environment.useMocks) {
      const data = MOCK_TIME_ENTRIES_BY_TENANT[tenantId] ?? MOCK_TIME_ENTRIES_BY_TENANT[TENANTS[0].id];
      return of(data).pipe(delay(900));
    }
    return this.http.get<readonly TimeEntry[]>(`${environment.apiBaseUrl}/tenants/${tenantId}/time-entries`);
  }
}
