import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

import { environment } from "src/environments/environment";
import { ZEDERE_DEMO_DB } from "./zedere-demo-db";

type DemoMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

@Injectable()
export class ZedereMockApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.demoMode) {
      return next.handle(req);
    }

    if (/^https:\/\/api\.airtable\.com\//i.test(req.url)) {
      return next.handle(req);
    }


    if (/^https:\/\/api\.airtable\.com\//i.test(req.url)) {
      return next.handle(req);
    }


    if (/^https:\/\/api\.airtable\.com\//i.test(req.url)) {
      return next.handle(req);
    }


    if (/^https:\/\/api\.airtable\.com\//i.test(req.url)) {
      return next.handle(req);
    }


    const method = req.method.toUpperCase() as DemoMethod;
    const url = this.cleanUrl(req.url);

    const body = this.route(method, url, req.body);

    if (body === undefined) {
      return next.handle(req);
    }

    return of(
      new HttpResponse({
        status: 200,
        body,
      })
    ).pipe(delay(180));
  }

  private cleanUrl(url: string): string {
    return String(url || "")
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/api\//, "")
      .replace(/^api\//, "")
      .replace(/^\//, "")
      .split("?")[0]
      .trim();
  }

  private route(method: DemoMethod, url: string, body: any): any {
    const db = ZEDERE_DEMO_DB;

    // ---------------------------------------------------------------------
    // AUTH
    // ---------------------------------------------------------------------
    if (method === "POST" && this.match(url, ["auth/login", "login"])) {
      return {
        token: db.auth.token,
        accessToken: db.auth.token,
        username: db.auth.username,
        displayName: db.auth.displayName,
        fullName: db.auth.fullName,
        roles: db.auth.roles,
        permissions: db.auth.permissions,
      };
    }

    if (method === "GET" && this.match(url, ["auth/me", "me", "users/me"])) {
      return db.auth;
    }

    if (method === "POST" && this.match(url, ["auth/logout", "logout"])) {
      return this.ok("Demo logout success");
    }

    // ---------------------------------------------------------------------
    // COMMON / MAIN MENU / DASHBOARD
    // ---------------------------------------------------------------------
    if (method === "GET" && this.containsAny(url, ["mainmenu", "main-menu", "menu"])) {
      return db.mainMenu;
    }

    if (method === "GET" && this.containsAny(url, ["dashboard/summary", "dashboard"])) {
      return db.dashboard;
    }

    // ---------------------------------------------------------------------
    // ZEDERE ERP MODULES
    // ---------------------------------------------------------------------
    if (method === "GET" && this.containsAny(url, ["production/jobs", "production-jobs"])) {
      return this.page(db.productionJobs);
    }

    if (method === "GET" && this.containsAny(url, ["material-control", "materials"])) {
      return this.page(db.materialControl);
    }

    if (method === "GET" && this.containsAny(url, ["quality-control", "qc"])) {
      return this.page(db.qualityControl);
    }

    if (method === "GET" && this.containsAny(url, ["packing"])) {
      return this.page(db.packing);
    }

    if (method === "GET" && this.containsAny(url, ["product-master", "products"])) {
      return this.page(db.productMasters);
    }

    if (method === "GET" && this.containsAny(url, ["bom-routing", "bom", "routing"])) {
      return this.page(db.bomRouting);
    }

    if (method === "GET" && this.containsAny(url, ["workflow/definitions", "workflow"])) {
      return this.page(db.workflows);
    }

    // ---------------------------------------------------------------------
    // PREMIX
    // ---------------------------------------------------------------------
    if (method === "GET" && this.containsAny(url, ["premix/jobs", "premix/job"])) {
      return this.page(db.premixJobs);
    }

    if (method === "POST" && this.containsAny(url, ["premix/jobs", "premix/job"])) {
      const created = this.createRow(db.premixJobs, {
        jobNo: `PMX-DEMO-${String(db.premixJobs.length + 1).padStart(3, "0")}`,
        jobDate: this.today(),
        status: "DRAFT",
        shiftName: "D",
        ...(body || {}),
      });

      return created;
    }

    if (method === "GET" && this.containsAny(url, ["premix/formulas", "premix/formula"])) {
      return this.page(db.premixFormulas);
    }

    if (method === "GET" && this.containsAny(url, ["premix/store", "premix-store", "store/stock"])) {
      return this.page(db.premixStoreStock);
    }

    if (method === "GET" && this.containsAny(url, ["premix/label", "label-print", "print/queues"])) {
      return this.page(db.premixLabelQueues);
    }

    if (method === "POST" && this.containsAny(url, ["mark-printed", "printed"])) {
      return this.ok("Demo mark printed success");
    }

    if (method === "POST" && this.containsAny(url, ["cancel"])) {
      return this.ok("Demo cancel success");
    }

    if (method === "POST" && this.containsAny(url, ["approve", "confirm", "submit", "complete"])) {
      return this.ok("Demo workflow action success");
    }

    if (method === "POST" && this.containsAny(url, ["prepare", "split", "reserve", "release"])) {
      return {
        ...this.ok("Demo premix prepare action success"),
        draftId: 1,
        draftNo: "PMXPREP-20260622-090000",
        status: "CONFIRMED",
      };
    }

    // ---------------------------------------------------------------------
    // SAFE FALLBACK FOR DEMO MODE
    // เน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนโฌยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนโฌยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธยเนยเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนโฌยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขย endpoint เน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธยเนยเธเนโฌยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนโฌเธเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนโฌยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธยเนยเธเธขยเน€เธโฌเน€เธยเนยเธเน€เธโฌเน€เธยเธขยเน€เธเธเธขย map
    // ---------------------------------------------------------------------
    if (method === "GET") {
      return this.emptyByUrl(url);
    }

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return this.ok(`Demo ${method} success`);
    }

    return undefined;
  }

  private match(url: string, candidates: string[]): boolean {
    return candidates.some((item) => url === item || url.endsWith(`/${item}`));
  }

  private containsAny(url: string, needles: string[]): boolean {
    const lowerUrl = url.toLowerCase();
    return needles.some((needle) => lowerUrl.includes(needle.toLowerCase()));
  }

  private page<T>(items: T[], page = 0, size = 20): any {
    return {
      content: items,
      totalElements: items.length,
      totalPages: 1,
      number: page,
      page,
      size,
      first: true,
      last: true,
      empty: items.length === 0,
    };
  }

  private ok(message: string): any {
    return {
      success: true,
      message,
      status: "SUCCESS",
      actionAt: new Date().toISOString(),
    };
  }

  private createRow<T extends Record<string, any>>(items: T[], payload: T): T {
    const nextId = items.length > 0
      ? Math.max(...items.map((item) => Number(item["id"] || 0))) + 1
      : 1;

    const created = {
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    } as T;

    items.unshift(created);
    return created;
  }

  private emptyByUrl(url: string): any {
    if (
      this.containsAny(url, [
        "search",
        "summaries",
        "summary-list",
        "list",
        "page",
        "items",
        "details",
        "histories",
        "transactions",
      ])
    ) {
      return this.page([]);
    }

    if (this.containsAny(url, ["count", "total"])) {
      return { total: 0, count: 0 };
    }

    if (this.containsAny(url, ["latest", "current", "active"])) {
      return {};
    }

    return this.page([]);
  }

  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
}
