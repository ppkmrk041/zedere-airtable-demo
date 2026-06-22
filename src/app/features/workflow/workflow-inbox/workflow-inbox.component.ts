import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { PageResponse, WorkflowTaskResponse } from '../../../core/models/workflow.model';
import { WorkflowRuntimeService } from '../../../core/services/workflow-runtime.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-workflow-inbox',
  templateUrl: './workflow-inbox.component.html',
  styleUrls: ['./workflow-inbox.component.css'],
})
export class WorkflowInboxComponent implements OnInit {
  loading = false;
  actioning = false;
  errorMessage = '';
  successMessage = '';
  tasks: WorkflowTaskResponse[] = [];
  pageIndex = 0;
  pageSize = 20;
  total = 0;

  constructor(
    private workflowRuntimeService: WorkflowRuntimeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load(0);
  }

  load(page = this.pageIndex): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.workflowRuntimeService
      .inbox(page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => this.applyResult(res),
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลด Workflow Inbox ไม่สำเร็จ')),
      });
  }

  open(task: WorkflowTaskResponse): void {
    if (!task.instanceId) return;
    this.router.navigate(['/workflow', task.instanceId]);
  }

  approve(task: WorkflowTaskResponse): void {
    this.runAction(task, 'APPROVE');
  }

  reject(task: WorkflowTaskResponse): void {
    this.runAction(task, 'REJECT');
  }

  returnPrevious(task: WorkflowTaskResponse): void {
    this.runAction(task, 'RETURN_PREVIOUS');
  }

  statusClass(status?: string | null): string {
    return `status-pill s-${String(status || 'UNKNOWN').toUpperCase().replace(/_/g, '-')}`;
  }

  get openTaskCount(): number {
    return this.tasks.filter((t) => String(t.taskStatus || '').toUpperCase() === 'OPEN').length;
  }

  get claimedTaskCount(): number {
    return this.tasks.filter((t) => String(t.taskStatus || '').toUpperCase() === 'CLAIMED').length;
  }

  private runAction(task: WorkflowTaskResponse, action: 'APPROVE' | 'REJECT' | 'RETURN_PREVIOUS'): void {
    if (!task.instanceId || this.actioning) return;

    const label = action === 'APPROVE' ? 'อนุมัติ' : action === 'REJECT' ? 'Reject' : 'ส่งกลับ Step ก่อนหน้า';
    const comment = window.prompt(`ระบุหมายเหตุสำหรับการ${label}`, '') || '';
    const payload = { comment };

    this.actioning = true;
    this.errorMessage = '';
    this.successMessage = '';

    const req = action === 'APPROVE'
      ? this.workflowRuntimeService.approve(task.instanceId, payload)
      : action === 'REJECT'
        ? this.workflowRuntimeService.reject(task.instanceId, payload)
        : this.workflowRuntimeService.returnPrevious(task.instanceId, payload);

    req.pipe(finalize(() => (this.actioning = false))).subscribe({
      next: () => {
        this.successMessage = `${label} เรียบร้อย`;
        this.load(this.pageIndex);
      },
      error: (err) => (this.errorMessage = extractErrorMessage(err, `${label} ไม่สำเร็จ`)),
    });
  }

  private applyResult(res: PageResponse<WorkflowTaskResponse> | WorkflowTaskResponse[]): void {
    if (Array.isArray(res)) {
      this.tasks = res;
      this.total = res.length;
      return;
    }

    this.tasks = res?.content ?? [];
    this.total = res?.totalElements ?? this.tasks.length;
    this.pageIndex = res?.number ?? 0;
    this.pageSize = res?.size ?? this.pageSize;
  }
}
