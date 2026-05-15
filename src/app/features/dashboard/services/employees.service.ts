import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Employee } from '../../../core/models/employee.model';
import { MOCK_EMPLOYEES } from '../mock/employees.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly Employee[]> {
    if (environment.useMocks) {
      return of(MOCK_EMPLOYEES).pipe(delay(250));
    }
    return this.http.get<readonly Employee[]>(`${environment.apiBaseUrl}/employees`);
  }
}
