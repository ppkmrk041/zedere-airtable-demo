import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "src/environments/environment";
import {
  AirtableDeleteResponse,
  AirtableListResponse,
  AirtableMutationResponse,
  AirtableRecord,
} from "../models/airtable-crud.model";

@Injectable({
  providedIn: "root",
})
export class AirtableCrudService {
  private readonly endpoint = String((environment as any).airtableEndpoint || "").trim();
  private readonly token = String((environment as any).airtableToken || "").trim();
  private readonly pageSize = Number((environment as any).airtablePageSize || 100);

  constructor(private http: HttpClient) {}

  list(offset?: string): Observable<AirtableListResponse> {
    if (!this.ready()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    let params = new HttpParams().set("pageSize", String(this.pageSize));

    if (offset) {
      params = params.set("offset", offset);
    }

    return this.http.get<AirtableListResponse>(this.endpoint, {
      headers: this.headers(),
      params,
    });
  }

  create(fields: Record<string, any>): Observable<AirtableRecord> {
    if (!this.ready()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    return this.http
      .post<AirtableMutationResponse>(
        this.endpoint,
        { records: [{ fields }] },
        { headers: this.headers() }
      )
      .pipe(map((res) => res.records[0]));
  }

  update(id: string, fields: Record<string, any>): Observable<AirtableRecord> {
    if (!this.ready()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    return this.http
      .patch<AirtableMutationResponse>(
        this.endpoint,
        { records: [{ id, fields }] },
        { headers: this.headers() }
      )
      .pipe(map((res) => res.records[0]));
  }

  delete(id: string): Observable<boolean> {
    if (!this.ready()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    const params = new HttpParams().append("records[]", id);

    return this.http
      .delete<AirtableDeleteResponse>(this.endpoint, {
        headers: this.headers(),
        params,
      })
      .pipe(map((res) => res.records?.[0]?.deleted === true));
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
  }

  private ready(): boolean {
    return this.endpoint.length > 0 && this.token.length > 0;
  }
}
