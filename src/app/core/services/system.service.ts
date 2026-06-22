import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ActuatorHealthResponse, ActuatorInfoResponse } from '../models/system.model';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly actuatorUrl = environment.actuatorURL;

  constructor(private http: HttpClient) {}

  health(): Observable<ActuatorHealthResponse> {
    return this.http.get<ActuatorHealthResponse>(`${this.actuatorUrl}/health`).pipe(
      catchError(() => of({ status: 'DOWN' }))
    );
  }

  info(): Observable<ActuatorInfoResponse> {
    return this.http.get<ActuatorInfoResponse>(`${this.actuatorUrl}/info`).pipe(
      catchError(() => of({}))
    );
  }
}
