import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import {
  PageResponse,
  WorkflowActionRequest,
  WorkflowHistoryResponse,
  WorkflowInstanceResponse,
  WorkflowReturnStepRequest,
  WorkflowStartRequest,
  WorkflowTaskResponse,
} from "../models/workflow.model";

@Injectable({ providedIn: "root" })
export class WorkflowRuntimeService {
  private readonly baseUrl = `${environment.baseURL}/workflows`;

  constructor(private http: HttpClient) {}

  inbox(
    page = 0,
    size = 20
  ): Observable<PageResponse<WorkflowTaskResponse> | WorkflowTaskResponse[]> {
    return this.http.get<PageResponse<WorkflowTaskResponse> | WorkflowTaskResponse[]>(
      `${this.baseUrl}/inbox`,
      { params: this.pageParams(page, size) }
    );
  }

  pending(
    page = 0,
    size = 20
  ): Observable<PageResponse<WorkflowInstanceResponse> | WorkflowInstanceResponse[]> {
    return this.http.get<
      PageResponse<WorkflowInstanceResponse> | WorkflowInstanceResponse[]
    >(`${this.baseUrl}/pending`, { params: this.pageParams(page, size) });
  }

  myRequests(
    page = 0,
    size = 20
  ): Observable<PageResponse<WorkflowInstanceResponse> | WorkflowInstanceResponse[]> {
    return this.http.get<
      PageResponse<WorkflowInstanceResponse> | WorkflowInstanceResponse[]
    >(`${this.baseUrl}/my-requests`, { params: this.pageParams(page, size) });
  }

  get(instanceId: number): Observable<WorkflowInstanceResponse> {
    return this.http.get<WorkflowInstanceResponse>(`${this.baseUrl}/${instanceId}`);
  }

  timeline(instanceId: number): Observable<WorkflowHistoryResponse[]> {
    return this.http.get<WorkflowHistoryResponse[]>(
      `${this.baseUrl}/${instanceId}/timeline`
    );
  }

  tasks(instanceId: number): Observable<WorkflowTaskResponse[]> {
    return this.http.get<WorkflowTaskResponse[]>(
      `${this.baseUrl}/${instanceId}/tasks`
    );
  }

  start(payload: WorkflowStartRequest): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/start`,
      payload
    );
  }

  submit(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/submit`,
      this.cleanActionPayload(payload)
    );
  }

  approve(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/approve`,
      this.cleanActionPayload(payload)
    );
  }

  reject(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/reject`,
      this.cleanActionPayload(payload)
    );
  }

  returnPrevious(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/return-previous`,
      this.cleanActionPayload(payload)
    );
  }

  returnStep(
    instanceId: number,
    payload: WorkflowReturnStepRequest | WorkflowActionRequest
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/return-step`,
      this.toReturnStepPayload(payload)
    );
  }

  hold(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/hold`,
      this.cleanActionPayload(payload)
    );
  }

  release(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/release`,
      this.cleanActionPayload(payload)
    );
  }

  cancel(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/cancel`,
      this.cleanActionPayload(payload)
    );
  }

  reopen(
    instanceId: number,
    payload: WorkflowActionRequest = {}
  ): Observable<WorkflowInstanceResponse> {
    return this.http.post<WorkflowInstanceResponse>(
      `${this.baseUrl}/${instanceId}/reopen`,
      this.cleanActionPayload(payload)
    );
  }

  private pageParams(page: number, size: number): HttpParams {
    return new HttpParams()
      .set("page", String(page))
      .set("size", String(size));
  }

  private cleanActionPayload(payload: WorkflowActionRequest): WorkflowActionRequest {
    return {
      comment: payload?.comment ?? null,
      reasonCode: payload?.reasonCode ?? null,
    };
  }

  private toReturnStepPayload(
    payload: WorkflowReturnStepRequest | WorkflowActionRequest
  ): WorkflowReturnStepRequest {
    const anyPayload = payload as WorkflowReturnStepRequest & WorkflowActionRequest;

    return {
      stepId: anyPayload.stepId ?? null,
      stepCode: String(anyPayload.stepCode || anyPayload.targetStepCode || "").trim(),
      comment: anyPayload.comment ?? null,
      reasonCode: anyPayload.reasonCode ?? null,
    };
  }
}