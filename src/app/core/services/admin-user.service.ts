import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/api.model';
import { AdminResetPasswordRequest, AdminUserResponse, AdminUserUpdateRequest } from '../models/user.model';

export interface AdminUserQuery {
  q?: string;
  role?: string;
  enabled?: boolean | null;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly baseUrl = `${environment.baseURL}/admin/users`;

  constructor(private http: HttpClient) {}

  listUsers(query: AdminUserQuery = {}): Observable<PageResponse<AdminUserResponse>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 0))
      .set('size', String(query.size ?? 20))
      .set('sort', query.sort ?? 'id,desc');

    if (query.q?.trim()) params = params.set('q', query.q.trim());
    if (query.role?.trim()) params = params.set('role', query.role.trim());
    if (query.enabled !== null && query.enabled !== undefined) params = params.set('enabled', String(query.enabled));

    return this.http.get<PageResponse<AdminUserResponse>>(this.baseUrl, { params });
  }

  getUser(id: number): Observable<AdminUserResponse> {
    return this.http.get<AdminUserResponse>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: number, payload: AdminUserUpdateRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.baseUrl}/${id}`, payload);
  }

  resetPassword(id: number, payload: AdminResetPasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/password`, payload);
  }

  lockUser(id: number, minutes = 15): Observable<{ message: string }> {
    const params = new HttpParams().set('minutes', String(minutes));
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/lock`, null, { params });
  }

  unlockUser(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/unlock`, {});
  }
}
