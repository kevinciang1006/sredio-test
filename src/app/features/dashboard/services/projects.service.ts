import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { MOCK_PROJECTS } from '../mock/projects.mock';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<readonly Project[]> {
    if (environment.useMocks) {
      return of(MOCK_PROJECTS).pipe(delay(200));
    }
    return this.http.get<readonly Project[]>(`${environment.apiBaseUrl}/projects`);
  }
}
