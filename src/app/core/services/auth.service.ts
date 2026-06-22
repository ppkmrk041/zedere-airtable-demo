import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  StoredAuthUser,
  UserLoginRequest,
  UserRegisterRequest,
} from '../models/auth.model';
import { MeResponse } from '../models/user.model';
import { ThemeService } from './theme.service';

export type StoredUser = StoredAuthUser;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'app.accessToken';
  private readonly refreshTokenKey = 'app.refreshToken';
  private readonly userKey = 'app.user';
  private readonly baseUrl = environment.baseURL;

  constructor(
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService
  ) {}

  login(payload: UserLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  register(payload: UserRegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, payload);
  }

  refresh(payload: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/refresh`, payload).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  refreshSession(): Observable<RefreshTokenResponse> {
    return this.refresh({ refreshToken: this.getRefreshToken() || '' });
  }

  logout(): Observable<{ message: string }> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.forceLogout(false);
      return of({ message: 'ออกจากระบบสำเร็จ' });
    }

    return this.http
      .post<{ message: string }>(`${this.baseUrl}/logout`, { refreshToken })
      .pipe(tap(() => this.forceLogout(false)));
  }

  saveSession(res: AuthResponse | RefreshTokenResponse): void {
    if (res.token) {
      localStorage.setItem(this.accessTokenKey, res.token);
    }

    if (res.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, res.refreshToken);
    }

    const user: StoredUser = {
      id: res.id,
      username: res.username,
      fullName: res.fullName,
      role: res.role,
      permissions: Array.isArray(res.permissions) ? res.permissions : [],
      themePreset: res.themePreset ?? undefined,
      themeAccentColor: res.themeAccentColor ?? undefined,
      defaultCompanyId: res.defaultCompanyId ?? null,
    };

    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.themeService.applyTheme(res.themePreset, res.themeAccentColor);
  }

  setSession(res: AuthResponse | RefreshTokenResponse): void {
    this.saveSession(res);
  }

  absorbMe(me: MeResponse): void {
    const current = this.getStoredUser();

    const user: StoredUser = {
      id: me.id,
      username: me.username,
      fullName: me.fullName,
      role: me.role,
      permissions: Array.isArray(me.permissions) ? me.permissions : current.permissions || [],
      themePreset: me.themePreset ?? current.themePreset,
      themeAccentColor: me.themeAccentColor ?? current.themeAccentColor,
      defaultCompanyId: me.defaultCompanyId ?? null,
    };

    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  updateStoredUser(patch: Partial<StoredUser>): void {
    const current = this.getStoredUser();

    const next: StoredUser = {
      ...current,
      ...patch,
      permissions: Array.isArray(patch.permissions) ? patch.permissions : current.permissions || [],
      themePreset: patch.themePreset ?? current.themePreset,
      themeAccentColor: patch.themeAccentColor ?? current.themeAccentColor,
      defaultCompanyId:
        patch.defaultCompanyId !== undefined
          ? patch.defaultCompanyId
          : current.defaultCompanyId ?? null,
    };

    localStorage.setItem(this.userKey, JSON.stringify(next));
  }

  getStoredUserSnapshot(): StoredUser {
    return this.getStoredUser();
  }

  forceLogout(redirect = true): void {
    this.clearSession();
    this.themeService.resetTheme();

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getStoredUser(): StoredUser {
    try {
      const raw = localStorage.getItem(this.userKey);
      if (!raw) return { permissions: [] };

      const parsed = JSON.parse(raw) as StoredUser;

      return {
        ...parsed,
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      };
    } catch {
      return { permissions: [] };
    }
  }

  getUsername(): string {
    return this.getStoredUser().username || '';
  }

  getFullName(): string {
    return this.getStoredUser().fullName || '';
  }

  getRole(): string {
    return this.getStoredUser().role || '';
  }

  getDefaultCompanyId(): number | null {
    return this.getStoredUser().defaultCompanyId ?? null;
  }

  getThemePreset(): string {
    return this.getStoredUser().themePreset || this.themeService.getStoredThemePreset();
  }

  getThemeAccentColor(): string {
    return this.getStoredUser().themeAccentColor || this.themeService.getStoredAccentColor();
  }

  getPermissions(): string[] {
    return this.getStoredUser().permissions || [];
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  hasPermission(permission?: string | null): boolean {
    if (!permission) return true;
    if (this.isAdmin()) return true;
    return this.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions?: string[] | null): boolean {
    if (!permissions || permissions.length === 0) return true;
    if (this.isAdmin()) return true;
    return permissions.some((permission) => this.hasPermission(permission));
  }
}
