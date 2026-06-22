import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  WorkflowDefinitionRequest,
  WorkflowDefinitionResponse,
  WorkflowStepRequest,
  WorkflowStepResponse,
} from '../models/workflow.model';

@Injectable({ providedIn: 'root' })
export class WorkflowAdminService {
  private readonly baseUrl = `${environment.baseURL}/admin/workflows`;

  constructor(private http: HttpClient) {}

  list(): Observable<WorkflowDefinitionResponse[]> {
    return this.http.get<WorkflowDefinitionResponse[]>(this.baseUrl);
  }

  get(id: number): Observable<WorkflowDefinitionResponse> {
    return this.http.get<WorkflowDefinitionResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: WorkflowDefinitionRequest): Observable<WorkflowDefinitionResponse> {
    return this.http.post<WorkflowDefinitionResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: WorkflowDefinitionRequest): Observable<WorkflowDefinitionResponse> {
    return this.http.put<WorkflowDefinitionResponse>(`${this.baseUrl}/${id}`, payload);
  }

  steps(definitionId: number): Observable<WorkflowStepResponse[]> {
    return this.http.get<WorkflowStepResponse[]>(`${this.baseUrl}/${definitionId}/steps`);
  }

  createStep(definitionId: number, payload: WorkflowStepRequest): Observable<WorkflowStepResponse> {
    return this.http.post<WorkflowStepResponse>(`${this.baseUrl}/${definitionId}/steps`, payload);
  }

  updateStep(definitionId: number, stepId: number, payload: WorkflowStepRequest): Observable<WorkflowStepResponse> {
    return this.http.put<WorkflowStepResponse>(`${this.baseUrl}/${definitionId}/steps/${stepId}`, payload);
  }

  deleteStep(definitionId: number, stepId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${definitionId}/steps/${stepId}`);
  }
}
