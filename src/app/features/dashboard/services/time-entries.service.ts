import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TimeEntry } from '../models/time-entry.model';
import { MOCK_TIME_ENTRIES } from '../mock/time-entries.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimeEntriesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly TimeEntry[]> {
    if (environment.useMocks) {
      return of(MOCK_TIME_ENTRIES).pipe(delay(400));
    }
    return this.http.get<readonly TimeEntry[]>(`${environment.apiBaseUrl}/time-entries`);
  }
}
