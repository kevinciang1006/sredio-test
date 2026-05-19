import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client } from '../../../core/models/client.model';
import { MOCK_CLIENTS } from '../mock/clients.mock';
import { TENANTS } from '../../../core/constants/tenants.const';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  getCurrent(tenantId: string): Observable<Client> {
    if (environment.useMocks) {
      return of(MOCK_CLIENTS[tenantId] ?? MOCK_CLIENTS[TENANTS[0].id]).pipe(delay(200));
    }
    return this.http.get<Client>(`${environment.apiBaseUrl}/clients/${tenantId}`);
  }
}
