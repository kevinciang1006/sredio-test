import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { MOCK_PROJECTS_BY_TENANT } from '../mock/projects.mock';
import { TENANTS } from '../../../core/constants/tenants.const';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: string): Observable<readonly Project[]> {
    if (environment.useMocks) {
      const data = MOCK_PROJECTS_BY_TENANT[tenantId] ?? MOCK_PROJECTS_BY_TENANT[TENANTS[0].id];
      return of(data).pipe(delay(300));
    }
    return this.http.get<readonly Project[]>(`${environment.apiBaseUrl}/tenants/${tenantId}/projects`);
  }
}
