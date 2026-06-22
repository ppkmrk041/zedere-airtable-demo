import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "src/environments/environment";
import {
  AirtableCreateUpdateResponse,
  AirtableDeleteResponse,
  AirtableListResponse,
  AirtableRecord,
} from "../models/airtable-master-data.model";

@Injectable({
  providedIn: "root",
})
export class AirtableMasterDataService {
  private readonly endpoint = String((environment as any).airtableEndpoint || "").trim();
  private readonly token = String((environment as any).airtableToken || "").trim();
  private readonly pageSize = Number((environment as any).airtablePageSize || 100);

  constructor(private http: HttpClient) {}

  list(offset?: string): Observable<AirtableListResponse> {
    if (!this.isReady()) {
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
    if (!this.isReady()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    return this.http
      .post<AirtableCreateUpdateResponse>(
        this.endpoint,
        {
          records: [
            {
              fields,
            },
          ],
        },
        {
          headers: this.headers(),
        }
      )
      .pipe(map((response) => response.records[0]));
  }

  update(recordId: string, fields: Record<string, any>): Observable<AirtableRecord> {
    if (!this.isReady()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    return this.http
      .patch<AirtableCreateUpdateResponse>(
        this.endpoint,
        {
          records: [
            {
              id: recordId,
              fields,
            },
          ],
        },
        {
          headers: this.headers(),
        }
      )
      .pipe(map((response) => response.records[0]));
  }

  delete(recordId: string): Observable<boolean> {
    if (!this.isReady()) {
      return throwError(() => new Error("Airtable endpoint/token is not configured."));
    }

    const params = new HttpParams().append("records[]", recordId);

    return this.http
      .delete<AirtableDeleteResponse>(this.endpoint, {
        headers: this.headers(),
        params,
      })
      .pipe(map((response) => response.records?.[0]?.deleted === true));
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
  }

  private isReady(): boolean {
    return this.endpoint.length > 0 && this.token.length > 0;
  }
}
