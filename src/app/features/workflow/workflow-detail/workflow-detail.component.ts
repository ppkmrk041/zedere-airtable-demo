import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { WorkflowHistoryResponse, WorkflowInstanceResponse, WorkflowTaskResponse } from '../../../core/models/workflow.model';
import { WorkflowRuntimeService } from '../../../core/services/workflow-runtime.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.css'],
})
export class WorkflowDetailComponent implements OnInit {
  loading = false;
  actioning = false;
  errorMessage = '';
  successMessage = '';
  instanceId = 0;
  instance: WorkflowInstanceResponse | null = null;
  timeline: WorkflowHistoryResponse[] = [];
  tasks: WorkflowTaskResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowRuntimeService: WorkflowRuntimeService
  ) {}

  ngOnInit(): void {
    this.instanceId = Number(this.route.snapshot.paramMap.get('instanceId') || 0);
    if (this.instanceId > 0) this.load();
  }

  load(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.workflowRuntimeService.get(this.instanceId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.instance = res;
          this.loadTimeline();
          this.loadTasks();
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลด Workflow Detail ไม่สำเร็จ')),
      });
  }

  loadTimeline(): void {
    this.workflowRuntimeService.timeline(this.instanceId).subscribe({
      next: (res) => (this.timeline = res ?? []),
      error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลด Timeline ไม่สำเร็จ')),
    });
  }

  loadTasks(): void {
    this.workflowRuntimeService.tasks(this.instanceId).subscribe({
      next: (res) => (this.tasks = res ?? []),
      error: () => (this.tasks = []),
    });
  }

  approve(): void { this.runAction('APPROVE'); }
  reject(): void { this.runAction('REJECT'); }
  returnPrevious(): void { this.runAction('RETURN_PREVIOUS'); }
  hold(): void { this.runAction('HOLD'); }
  release(): void { this.runAction('RELEASE'); }
  cancel(): void { this.runAction('CANCEL'); }
  reopen(): void { this.runAction('REOPEN'); }

  back(): void {
    this.router.navigate(['/workflow/monitor']);
  }

  statusClass(status?: string | null): string {
    return `status-pill s-${String(status || 'UNKNOWN').toUpperCase().replace(/_/g, '-')}`;
  }

  private runAction(action: 'APPROVE' | 'REJECT' | 'RETURN_PREVIOUS' | 'HOLD' | 'RELEASE' | 'CANCEL' | 'REOPEN'): void {
    if (!this.instanceId || this.actioning) return;
    const comment = window.prompt(`ระบุหมายเหตุสำหรับ ${action}`, '') || '';
    const payload = { comment };

    this.actioning = true;
    this.errorMessage = '';
    this.successMessage = '';

    const req = action === 'APPROVE'
      ? this.workflowRuntimeService.approve(this.instanceId, payload)
      : action === 'REJECT'
        ? this.workflowRuntimeService.reject(this.instanceId, payload)
        : action === 'RETURN_PREVIOUS'
          ? this.workflowRuntimeService.returnPrevious(this.instanceId, payload)
          : action === 'HOLD'
            ? this.workflowRuntimeService.hold(this.instanceId, payload)
            : action === 'RELEASE'
              ? this.workflowRuntimeService.release(this.instanceId, payload)
              : action === 'CANCEL'
                ? this.workflowRuntimeService.cancel(this.instanceId, payload)
                : this.workflowRuntimeService.reopen(this.instanceId, payload);

    req.pipe(finalize(() => (this.actioning = false))).subscribe({
      next: (res) => {
        this.instance = res;
        this.successMessage = `${action} เรียบร้อย`;
        this.loadTimeline();
        this.loadTasks();
      },
      error: (err) => (this.errorMessage = extractErrorMessage(err, `${action} ไม่สำเร็จ`)),
    });
  }
}
