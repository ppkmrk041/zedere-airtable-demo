import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { PageResponse, WorkflowInstanceResponse } from '../../../core/models/workflow.model';
import { WorkflowRuntimeService } from '../../../core/services/workflow-runtime.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-workflow-monitor',
  templateUrl: './workflow-monitor.component.html',
  styleUrls: ['./workflow-monitor.component.css'],
})
export class WorkflowMonitorComponent implements OnInit {
  loadingPending = false;
  loadingMine = false;
  errorMessage = '';
  pending: WorkflowInstanceResponse[] = [];
  myRequests: WorkflowInstanceResponse[] = [];
  pageSize = 20;

  constructor(
    private workflowRuntimeService: WorkflowRuntimeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadPending();
    this.loadMyRequests();
  }

  loadPending(): void {
    this.loadingPending = true;
    this.errorMessage = '';
    this.workflowRuntimeService.pending(0, this.pageSize)
      .pipe(finalize(() => (this.loadingPending = false)))
      .subscribe({
        next: (res) => (this.pending = this.toArray(res)),
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลดรายการ Pending ไม่สำเร็จ')),
      });
  }

  loadMyRequests(): void {
    this.loadingMine = true;
    this.errorMessage = '';
    this.workflowRuntimeService.myRequests(0, this.pageSize)
      .pipe(finalize(() => (this.loadingMine = false)))
      .subscribe({
        next: (res) => (this.myRequests = this.toArray(res)),
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลดรายการ My Requests ไม่สำเร็จ')),
      });
  }

  open(row: WorkflowInstanceResponse): void {
    this.router.navigate(['/workflow', row.id]);
  }

  statusClass(status?: string | null): string {
    return `status-pill s-${String(status || 'UNKNOWN').toUpperCase().replace(/_/g, '-')}`;
  }

  get totalCount(): number {
    return this.pending.length + this.myRequests.length;
  }

  get loading(): boolean {
    return this.loadingPending || this.loadingMine;
  }

  private toArray(res: PageResponse<WorkflowInstanceResponse> | WorkflowInstanceResponse[]): WorkflowInstanceResponse[] {
    return Array.isArray(res) ? res : (res?.content ?? []);
  }
}
