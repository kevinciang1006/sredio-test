import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client } from '../../../core/models/client.model';
import { MOCK_CLIENT } from '../mock/clients.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  getCurrent(): Observable<Client> {
    if (environment.useMocks) {
      return of(MOCK_CLIENT).pipe(delay(200));
    }
    return this.http.get<Client>(`${environment.apiBaseUrl}/client`);
  }
}
