import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';
import { ChangePasswordRequest, MeResponse, MeUpdateRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MeService {
  private readonly baseUrl = `${environment.baseURL}/me`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(this.baseUrl).pipe(
      tap((me) => {
        this.authService.absorbMe(me);
        this.themeService.applyTheme(me.themePreset, me.themeAccentColor);
      })
    );
  }

  updateMe(payload: MeUpdateRequest): Observable<MeResponse> {
    return this.http.put<MeResponse>(this.baseUrl, payload).pipe(
      tap((me) => {
        this.authService.absorbMe(me);
        this.themeService.applyTheme(me.themePreset, me.themeAccentColor);
      })
    );
  }

  changePassword(payload: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/password`, payload);
  }
}
