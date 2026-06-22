import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/api.model';
import { AuditLogResponse } from '../models/audit-log.model';

export interface AuditLogQuery {
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly baseUrl = `${environment.baseURL}${environment.auditLogPath}`;

  constructor(private http: HttpClient) {}

  list(query: AuditLogQuery = {}): Observable<PageResponse<AuditLogResponse>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 0))
      .set('size', String(query.size ?? 20))
      .set('sort', query.sort ?? 'id,desc');

    if (query.q?.trim()) params = params.set('q', query.q.trim());

    return this.http.get<PageResponse<AuditLogResponse>>(this.baseUrl, { params }).pipe(
      catchError(() => of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: query.size ?? 20,
        number: query.page ?? 0,
      }))
    );
  }
}
