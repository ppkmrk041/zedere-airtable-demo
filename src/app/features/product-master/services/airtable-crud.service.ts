import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";

import {
  AirtableDeleteResponse,
  AirtableListResponse,
  AirtableMutationResponse,
  AirtableRecord,
} from "../models/airtable-crud.model";
import { AirtableSettingsService } from "./airtable-settings.service";

@Injectable({
  providedIn: "root",
})
export class AirtableCrudService {
  constructor(
    private http: HttpClient,
    private settingsService: AirtableSettingsService
  ) {}

  list(offset?: string): Observable<AirtableListResponse> {
    const context = this.context();
    if (!context) return this.notReadyList();

    let params = new HttpParams().set("pageSize", "100");
    if (offset) params = params.set("offset", offset);

    return this.http.get<AirtableListResponse>(context.endpoint, {
      headers: context.headers,
      params,
    });
  }

  create(fields: Record<string, any>): Observable<AirtableRecord> {
    const context = this.context();
    if (!context) return this.notReadyRecord();

    return this.http
      .post<AirtableMutationResponse>(
        context.endpoint,
        { records: [{ fields }] },
        { headers: context.headers }
      )
      .pipe(map((res) => res.records[0]));
  }

  update(id: string, fields: Record<string, any>): Observable<AirtableRecord> {
    const context = this.context();
    if (!context) return this.notReadyRecord();

    return this.http
      .patch<AirtableMutationResponse>(
        context.endpoint,
        { records: [{ id, fields }] },
        { headers: context.headers }
      )
      .pipe(map((res) => res.records[0]));
  }

  delete(id: string): Observable<boolean> {
    const context = this.context();
    if (!context) return throwError(() => new Error("กรุณาตั้งค่าการเชื่อมต่อ Airtable ก่อน"));

    const params = new HttpParams().append("records[]", id);

    return this.http
      .delete<AirtableDeleteResponse>(context.endpoint, {
        headers: context.headers,
        params,
      })
      .pipe(map((res) => res.records?.[0]?.deleted === true));
  }

  private context(): { endpoint: string; headers: HttpHeaders } | null {
    const settings = this.settingsService.load();
    const endpoint = this.settingsService.endpoint(settings);

    if (!this.settingsService.isReady(settings) || !endpoint) {
      return null;
    }

    return {
      endpoint,
      headers: new HttpHeaders({
        Authorization: `Bearer ${settings.token}`,
        "Content-Type": "application/json",
      }),
    };
  }

  private notReadyList(): Observable<AirtableListResponse> {
    return throwError(() => new Error("กรุณากรอก System Link, Base ID, Table ID และ Token แล้วกดบันทึกก่อน"));
  }

  private notReadyRecord(): Observable<AirtableRecord> {
    return throwError(() => new Error("กรุณากรอก System Link, Base ID, Table ID และ Token แล้วกดบันทึกก่อน"));
  }
}
