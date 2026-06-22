import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { WorkflowDefinitionRequest, WorkflowDefinitionResponse, WorkflowStepRequest, WorkflowStepResponse } from '../../../core/models/workflow.model';
import { WorkflowAdminService } from '../../../core/services/workflow-admin.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-workflow-definitions',
  templateUrl: './workflow-definitions.component.html',
  styleUrls: ['./workflow-definitions.component.css'],
})
export class WorkflowDefinitionsComponent implements OnInit {
  loading = false;
  loadingSteps = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  definitions: WorkflowDefinitionResponse[] = [];
  steps: WorkflowStepResponse[] = [];
  selectedDefinition: WorkflowDefinitionResponse | null = null;
  selectedStep: WorkflowStepResponse | null = null;

  readonly stepTypes = ['START', 'NORMAL', 'APPROVAL', 'FINAL', 'REJECTED', 'CANCELLED'];
  readonly approverTypes = ['ROLE', 'USER', 'REQUESTER_MANAGER', 'NONE'];
  readonly approverRoles = ['ADMIN', 'MANAGER', 'USER'];

  readonly form = this.fb.group({
    workflowCode: ['', Validators.required],
    workflowName: ['', Validators.required],
    moduleCode: [''],
    description: [''],
    active: [true],
    allowReturnPrevious: [true],
    allowReturnAnyStep: [true],
    allowCancel: [true],
  });

  readonly stepForm = this.fb.group({
    stepCode: ['', Validators.required],
    stepName: ['', Validators.required],
    stepOrder: [10, Validators.required],
    stepType: ['APPROVAL', Validators.required],
    approverType: ['ROLE', Validators.required],
    approverRole: ['MANAGER'],
    approverUserId: [null as number | null],
    requiredAllApprover: [false],
    allowEditDocument: [false],
    allowReturn: [true],
    allowReject: [true],
    allowHold: [true],
    active: [true],
  });

  constructor(
    private fb: FormBuilder,
    private workflowAdminService: WorkflowAdminService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.workflowAdminService.list()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.definitions = res ?? [];
          if (!this.selectedDefinition && this.definitions.length) this.selectDefinition(this.definitions[0]);
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลด Workflow Definition ไม่สำเร็จ')),
      });
  }

  newDefinition(): void {
    this.selectedDefinition = null;
    this.steps = [];
    this.successMessage = '';
    this.errorMessage = '';
    this.form.reset({
      workflowCode: '',
      workflowName: '',
      moduleCode: '',
      description: '',
      active: true,
      allowReturnPrevious: true,
      allowReturnAnyStep: true,
      allowCancel: true,
    });
    this.newStep();
  }

  selectDefinition(row: WorkflowDefinitionResponse): void {
    this.selectedDefinition = row;
    this.successMessage = '';
    this.errorMessage = '';
    this.form.patchValue({
      workflowCode: row.workflowCode || '',
      workflowName: row.workflowName || '',
      moduleCode: row.moduleCode || '',
      description: row.description || '',
      active: row.active,
      allowReturnPrevious: row.allowReturnPrevious ?? true,
      allowReturnAnyStep: row.allowReturnAnyStep ?? true,
      allowCancel: row.allowCancel ?? true,
    });
    this.loadSteps(row.id);
  }

  saveDefinition(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: WorkflowDefinitionRequest = {
      workflowCode: String(v.workflowCode || '').trim().toUpperCase(),
      workflowName: String(v.workflowName || '').trim(),
      moduleCode: String(v.moduleCode || '').trim().toUpperCase(),
      description: String(v.description || '').trim(),
      active: !!v.active,
      allowReturnPrevious: !!v.allowReturnPrevious,
      allowReturnAnyStep: !!v.allowReturnAnyStep,
      allowCancel: !!v.allowCancel,
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const req$ = this.selectedDefinition ? this.workflowAdminService.update(this.selectedDefinition.id, payload) : this.workflowAdminService.create(payload);
    req$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (res) => {
        this.selectedDefinition = res;
        this.successMessage = 'บันทึก Workflow Definition เรียบร้อย';
        this.load();
        this.loadSteps(res.id);
      },
      error: (err) => (this.errorMessage = extractErrorMessage(err, 'บันทึก Workflow Definition ไม่สำเร็จ')),
    });
  }

  loadSteps(definitionId: number): void {
    this.loadingSteps = true;
    this.errorMessage = '';
    this.workflowAdminService.steps(definitionId)
      .pipe(finalize(() => (this.loadingSteps = false)))
      .subscribe({
        next: (res) => (this.steps = (res ?? []).sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))),
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลด Workflow Step ไม่สำเร็จ')),
      });
  }

  newStep(): void {
    this.selectedStep = null;
    const nextOrder = this.steps.length ? Math.max(...this.steps.map((s) => s.stepOrder || 0)) + 10 : 10;
    this.stepForm.reset({
      stepCode: '',
      stepName: '',
      stepOrder: nextOrder,
      stepType: 'APPROVAL',
      approverType: 'ROLE',
      approverRole: 'MANAGER',
      approverUserId: null,
      requiredAllApprover: false,
      allowEditDocument: false,
      allowReturn: true,
      allowReject: true,
      allowHold: true,
      active: true,
    });
  }

  editStep(row: WorkflowStepResponse): void {
    this.selectedStep = row;
    this.stepForm.patchValue({
      stepCode: row.stepCode || '',
      stepName: row.stepName || '',
      stepOrder: row.stepOrder || 10,
      stepType: row.stepType || 'APPROVAL',
      approverType: row.approverType || 'ROLE',
      approverRole: row.approverRole || 'MANAGER',
      approverUserId: row.approverUserId || null,
      requiredAllApprover: row.requiredAllApprover ?? false,
      allowEditDocument: row.allowEditDocument ?? false,
      allowReturn: row.allowReturn ?? true,
      allowReject: row.allowReject ?? true,
      allowHold: row.allowHold ?? true,
      active: row.active,
    });
  }

  saveStep(): void {
    if (!this.selectedDefinition || this.stepForm.invalid || this.saving) {
      this.stepForm.markAllAsTouched();
      return;
    }
    const v = this.stepForm.getRawValue();
    const payload: WorkflowStepRequest = {
      stepCode: String(v.stepCode || '').trim().toUpperCase(),
      stepName: String(v.stepName || '').trim(),
      stepOrder: Number(v.stepOrder || 10),
      stepType: String(v.stepType || 'APPROVAL'),
      approverType: String(v.approverType || 'ROLE'),
      approverRole: String(v.approverRole || '').trim() || null,
      approverUserId: v.approverUserId ?? null,
      requiredAllApprover: !!v.requiredAllApprover,
      allowEditDocument: !!v.allowEditDocument,
      allowReturn: !!v.allowReturn,
      allowReject: !!v.allowReject,
      allowHold: !!v.allowHold,
      active: !!v.active,
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const req$ = this.selectedStep
      ? this.workflowAdminService.updateStep(this.selectedDefinition.id, this.selectedStep.id, payload)
      : this.workflowAdminService.createStep(this.selectedDefinition.id, payload);

    req$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.successMessage = 'บันทึก Workflow Step เรียบร้อย';
        this.loadSteps(this.selectedDefinition!.id);
        this.newStep();
      },
      error: (err) => (this.errorMessage = extractErrorMessage(err, 'บันทึก Workflow Step ไม่สำเร็จ')),
    });
  }

  deleteStep(row: WorkflowStepResponse): void {
    if (!this.selectedDefinition || !window.confirm(`ลบ Step ${row.stepCode}?`)) return;
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.workflowAdminService.deleteStep(this.selectedDefinition.id, row.id)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'ลบ Step เรียบร้อย';
          this.loadSteps(this.selectedDefinition!.id);
          this.newStep();
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'ลบ Step ไม่สำเร็จ')),
      });
  }

  statusClass(active?: boolean | null): string {
    return active ? 'status-pill s-APPROVED' : 'status-pill s-CANCELLED';
  }
}
