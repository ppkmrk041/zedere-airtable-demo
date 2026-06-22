import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { extractErrorMessage } from '../utils/http-error.util';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          console.warn('[API Error]', {
            method: req.method,
            url: req.urlWithParams,
            status: error.status,
            message: extractErrorMessage(error),
          });
        }
        return throwError(() => error);
      })
    );
  }
}
