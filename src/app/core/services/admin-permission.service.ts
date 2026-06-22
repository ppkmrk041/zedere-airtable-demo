import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  EffectivePermissionsResponse,
  PermissionCreateRequest,
  PermissionResponse,
  PermissionUpdateRequest,
  RolePermissionsResponse,
  RolePermissionsUpdateRequest,
  UserPermissionOverridesResponse,
  UserPermissionOverridesUpdateRequest,
} from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class AdminPermissionService {
  private readonly baseUrl = `${environment.baseURL}/admin/permissions`;

  constructor(private http: HttpClient) {}

  listPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<PermissionResponse[]>(this.baseUrl);
  }

  getPermission(id: number): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(`${this.baseUrl}/${id}`);
  }

  createPermission(payload: PermissionCreateRequest): Observable<PermissionResponse> {
    return this.http.post<PermissionResponse>(this.baseUrl, payload);
  }

  updatePermission(id: number, payload: PermissionUpdateRequest): Observable<PermissionResponse> {
    return this.http.put<PermissionResponse>(`${this.baseUrl}/${id}`, payload);
  }

  listRolePermissions(): Observable<RolePermissionsResponse[]> {
    return this.http.get<RolePermissionsResponse[]>(`${this.baseUrl}/roles`);
  }

  getRolePermissions(role: string): Observable<RolePermissionsResponse> {
    return this.http.get<RolePermissionsResponse>(`${this.baseUrl}/roles/${encodeURIComponent(role)}`);
  }

  replaceRolePermissions(role: string, payload: RolePermissionsUpdateRequest): Observable<RolePermissionsResponse> {
    return this.http.put<RolePermissionsResponse>(`${this.baseUrl}/roles/${encodeURIComponent(role)}`, payload);
  }

  getUserOverrides(userId: number): Observable<UserPermissionOverridesResponse> {
    return this.http.get<UserPermissionOverridesResponse>(`${this.baseUrl}/users/${userId}/overrides`);
  }

  replaceUserOverrides(userId: number, payload: UserPermissionOverridesUpdateRequest): Observable<UserPermissionOverridesResponse> {
    return this.http.put<UserPermissionOverridesResponse>(`${this.baseUrl}/users/${userId}/overrides`, payload);
  }

  getEffectivePermissions(userId: number): Observable<EffectivePermissionsResponse> {
    return this.http.get<EffectivePermissionsResponse>(`${this.baseUrl}/users/${userId}/effective`);
  }
}
