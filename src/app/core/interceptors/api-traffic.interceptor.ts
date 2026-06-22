import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable()
export class ApiTrafficInterceptor implements HttpInterceptor {
  private readonly enabled = environment.enableApiTrafficLog === true;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.enabled) {
      return next.handle(req);
    }

    const startedAt = performance.now();
    const requestId = this.createRequestId();
    const label = `%c[API ${requestId}] ${req.method} ${req.urlWithParams}`;

    console.groupCollapsed(label, 'color:#2563eb;font-weight:700;');
    console.log('➡️ Request URL:', req.urlWithParams);
    console.log('➡️ Method:', req.method);
    console.log('➡️ Headers:', this.toHeaderObject(req));
    console.log('➡️ Params:', this.toParamObject(req));
    console.log('➡️ Body:', this.safe(req.body));
    console.groupEnd();

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const duration = Math.round(performance.now() - startedAt);

          console.groupCollapsed(
            `%c[API ${requestId}] ✅ ${req.method} ${req.urlWithParams} | ${event.status} | ${duration}ms`,
            'color:#16a34a;font-weight:700;'
          );
          console.log('⬅️ Status:', event.status, event.statusText);
          console.log('⬅️ URL:', event.url);
          console.log('⬅️ Headers:', this.toResponseHeaderObject(event));
          console.log('⬅️ Body:', this.safe(event.body));
          console.groupEnd();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Math.round(performance.now() - startedAt);

        console.groupCollapsed(
          `%c[API ${requestId}] ❌ ${req.method} ${req.urlWithParams} | ${error.status} | ${duration}ms`,
          'color:#dc2626;font-weight:700;'
        );
        console.log('⬅️ Status:', error.status, error.statusText);
        console.log('⬅️ URL:', error.url);
        console.log('⬅️ Message:', error.message);
        console.log('⬅️ Error Body:', this.safe(error.error));
        console.groupEnd();

        return throwError(() => error);
      }),
      finalize(() => {
        // จุดนี้เว้นไว้ เผื่ออนาคตจะส่ง API traffic ไปเก็บที่ backend
      })
    );
  }

  private createRequestId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private toHeaderObject(req: HttpRequest<unknown>): Record<string, string | null> {
    const result: Record<string, string | null> = {};

    req.headers.keys().forEach((key) => {
      const value = req.headers.get(key);

      if (key.toLowerCase() === 'authorization' && value) {
        result[key] = 'Bearer ***masked***';
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  private toResponseHeaderObject(res: HttpResponse<unknown>): Record<string, string | null> {
    const result: Record<string, string | null> = {};

    res.headers.keys().forEach((key) => {
      result[key] = res.headers.get(key);
    });

    return result;
  }

  private toParamObject(req: HttpRequest<unknown>): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    req.params.keys().forEach((key) => {
      result[key] = req.params.getAll(key) ?? [];
    });

    return result;
  }

  private safe(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }
}
