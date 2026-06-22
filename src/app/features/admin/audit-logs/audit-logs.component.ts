import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLogResponse } from '../../../core/models/audit-log.model';

@Component({ selector: 'app-audit-logs', templateUrl: './audit-logs.component.html' })
export class AuditLogsComponent implements OnInit {
  loading = false;
  logs: AuditLogResponse[] = [];
  pageIndex = 0;
  pageSize = 20;
  total = 0;
  form = this.fb.group({ q: [''] });

  constructor(private fb: FormBuilder, private auditLogService: AuditLogService) {}

  ngOnInit(): void { this.load(0); }

  load(page = this.pageIndex): void {
    this.loading = true;
    this.pageIndex = page;

    this.auditLogService.list({
      q: String(this.form.value.q ?? '').trim(),
      page: this.pageIndex,
      size: this.pageSize,
      sort: 'id,desc',
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.logs = res.content ?? [];
        this.total = res.totalElements ?? 0;
        this.pageIndex = res.number ?? 0;
        this.pageSize = res.size ?? this.pageSize;
      });
  }
}
