import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const request = this.addTokenIfNeeded(req);

    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !this.isPublicEndpoint(req.url) &&
          this.authService.getRefreshToken()
        ) {
          return this.handle401(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenIfNeeded(req: HttpRequest<unknown>): HttpRequest<unknown> {
    if (this.isPublicEndpoint(req.url)) return req;

    const token = this.authService.getAccessToken();
    if (!token) return req;

    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.refreshing) {
      this.refreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshSession().pipe(
        switchMap((res) => {
          this.refreshing = false;
          const token = res.token;
          this.refreshTokenSubject.next(token);
          return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
        }),
        catchError((err) => {
          this.refreshing = false;
          this.authService.forceLogout(true);
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
    );
  }

  private isPublicEndpoint(url: string): boolean {
    return this.isPublicAuthEndpoint(url)
      || this.isActuatorEndpoint(url)
      || /\/v3\/api-docs(\/|\?|$)/.test(url)
      || /\/swagger-ui(\/|\?|$)/.test(url);
  }

  private isPublicAuthEndpoint(url: string): boolean {
    return /\/api\/(login|register|refresh|logout)(\?|$)/.test(url);
  }

  private isActuatorEndpoint(url: string): boolean {
    return /^https:\/\/api\.airtable\.com\//i.test(url) || url.startsWith(environment.actuatorURL) || /\/actuator\/(health|info)(\?|$)/.test(url);
  }
}
