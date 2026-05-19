import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Employee } from '../../../core/models/employee.model';
import { MOCK_EMPLOYEES_BY_TENANT } from '../mock/employees.mock';
import { TENANTS } from '../../../core/constants/tenants.const';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: string): Observable<readonly Employee[]> {
    if (environment.useMocks) {
      const data = MOCK_EMPLOYEES_BY_TENANT[tenantId] ?? MOCK_EMPLOYEES_BY_TENANT[TENANTS[0].id];
      return of(data).pipe(delay(300));
    }
    return this.http.get<readonly Employee[]>(`${environment.apiBaseUrl}/tenants/${tenantId}/employees`);
  }
}
