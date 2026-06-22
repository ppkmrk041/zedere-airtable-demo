import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  MiniProductionBoardColumnResponse,
  MiniProductionCancelRequest,
  MiniProductionCreateRequest,
  MiniProductionHistoryResponse,
  MiniProductionResponse,
  MiniProductionSearchParams,
  MiniProductionSubmitRequest,
  MiniProductionUpdateRequest,
  PageResponse,
} from '../models/mini-production.model';

@Injectable({ providedIn: 'root' })
export class MiniProductionService {
  private readonly baseUrl = `${environment.baseURL}/mini-production/works`;

  constructor(private http: HttpClient) {}

  search(params: MiniProductionSearchParams = {}): Observable<PageResponse<MiniProductionResponse>> {
    return this.http.get<PageResponse<MiniProductionResponse>>(this.baseUrl, {
      params: this.buildSearchParams(params),
    });
  }

  board(): Observable<MiniProductionBoardColumnResponse[]> {
    return this.http.get<MiniProductionBoardColumnResponse[]>(`${this.baseUrl}/board`);
  }

  get(id: number): Observable<MiniProductionResponse> {
    return this.http.get<MiniProductionResponse>(`${this.baseUrl}/${id}`);
  }

  history(id: number): Observable<MiniProductionHistoryResponse[]> {
    return this.http.get<MiniProductionHistoryResponse[]>(`${this.baseUrl}/${id}/history`);
  }

  create(payload: MiniProductionCreateRequest): Observable<MiniProductionResponse> {
    return this.http.post<MiniProductionResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: MiniProductionUpdateRequest): Observable<MiniProductionResponse> {
    return this.http.put<MiniProductionResponse>(`${this.baseUrl}/${id}`, payload);
  }

  submit(id: number, payload: MiniProductionSubmitRequest = {}): Observable<MiniProductionResponse> {
    return this.http.post<MiniProductionResponse>(`${this.baseUrl}/${id}/submit`, payload);
  }

  syncWorkflow(id: number): Observable<MiniProductionResponse> {
    return this.http.post<MiniProductionResponse>(`${this.baseUrl}/${id}/sync-workflow`, {});
  }

  cancel(id: number, payload: MiniProductionCancelRequest = {}): Observable<MiniProductionResponse> {
    return this.http.post<MiniProductionResponse>(`${this.baseUrl}/${id}/cancel`, payload);
  }

  private buildSearchParams(params: MiniProductionSearchParams): HttpParams {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20))
      .set('sort', params.sort || 'createdAt,desc');

    const q = String(params.q || '').trim();
    const status = String(params.status || '').trim();
    const lineCode = String(params.lineCode || '').trim();

    if (q) httpParams = httpParams.set('q', q);
    if (status) httpParams = httpParams.set('status', status);
    if (lineCode) httpParams = httpParams.set('lineCode', lineCode);

    return httpParams;
  }
}
