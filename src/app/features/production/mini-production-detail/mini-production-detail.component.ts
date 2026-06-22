import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MiniProductionHistoryResponse, MiniProductionPriority, MiniProductionResponse, MiniProductionUpdateRequest } from '../../../core/models/mini-production.model';
import { MiniProductionService } from '../../../core/services/mini-production.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

type DetailForm = {
  productCode: string;
  productName: string;
  qty: number | null;
  unit: string;
  lineCode: string;
  priority: MiniProductionPriority;
  dueDate: string;
  remark: string;
};

@Component({
  selector: 'app-mini-production-detail',
  templateUrl: './mini-production-detail.component.html',
  styleUrls: ['./mini-production-detail.component.css'],
})
export class MiniProductionDetailComponent implements OnInit {
  id = 0;
  loading = false;
  saving = false;
  actionLoading = false;
  editMode = false;
  errorMessage = '';
  successMessage = '';

  work: MiniProductionResponse | null = null;
  history: MiniProductionHistoryResponse[] = [];

  readonly priorities: MiniProductionPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
  readonly units = ['PCS', 'SET', 'EA', 'M2'];

  form: DetailForm = this.createEmptyForm();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: MiniProductionService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (this.id <= 0) {
      this.errorMessage = 'ไม่พบรหัสใบงานผลิต';
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api
      .get(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.work = res;
          this.form = this.toForm(res);
          this.loadHistory();
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลดรายละเอียดใบงานไม่สำเร็จ')),
      });
  }

  loadHistory(): void {
    this.api.history(this.id).subscribe({
      next: (res) => (this.history = res || []),
      error: () => (this.history = []),
    });
  }

  enableEdit(): void {
    if (!this.work) return;
    this.form = this.toForm(this.work);
    this.editMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    if (this.work) this.form = this.toForm(this.work);
    this.editMode = false;
  }

  save(): void {
    if (!this.work || this.saving) return;

    const payload = this.toUpdatePayload();
    if (!payload.productName || payload.qty <= 0 || !payload.unit) {
      this.errorMessage = 'กรุณากรอก Product Name, Qty และ Unit ให้ครบ';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api
      .update(this.work.id, payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (res) => {
          this.work = res;
          this.form = this.toForm(res);
          this.editMode = false;
          this.successMessage = 'บันทึกข้อมูลใบงานเรียบร้อย';
          this.loadHistory();
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'บันทึกใบงานไม่สำเร็จ')),
      });
  }

  submit(): void {
    if (!this.work || this.actionLoading) return;
    if (!window.confirm(`ยืนยัน Submit ใบงาน ${this.work.workNo} เข้า Workflow ?`)) return;

    this.runAction('submit', () => this.api.submit(this.work!.id, { comment: 'Submit from detail page' }));
  }

  syncWorkflow(): void {
    if (!this.work || this.actionLoading) return;
    this.runAction('sync', () => this.api.syncWorkflow(this.work!.id));
  }

  cancelWork(): void {
    if (!this.work || this.actionLoading) return;
    const comment = window.prompt('ระบุเหตุผลการยกเลิกใบงาน', 'Cancel from Mini Production Detail');
    if (comment === null) return;

    this.runAction('cancel', () => this.api.cancel(this.work!.id, { comment, reasonCode: 'USER_CANCEL' }));
  }

  openWorkflow(): void {
    if (!this.work?.workflowInstanceId) return;
    this.router.navigate(['/workflow', this.work.workflowInstanceId]);
  }

  back(): void {
    this.router.navigate(['/production/mini-works']);
  }

  statusClass(status: string | null | undefined): string {
    const value = String(status || '').toLowerCase();
    if (value === 'completed') return 'success';
    if (value === 'in_progress') return 'info';
    if (value === 'hold') return 'warning';
    if (value === 'cancelled') return 'danger';
    return 'muted';
  }

  canEdit(): boolean {
    return !!this.work && ['DRAFT', 'HOLD'].includes(String(this.work.status || ''));
  }

  canSubmit(): boolean {
    return !!this.work && String(this.work.status || '') === 'DRAFT' && !this.work.workflowInstanceId;
  }

  canCancel(): boolean {
    return !!this.work && !['COMPLETED', 'CANCELLED'].includes(String(this.work.status || ''));
  }

  private runAction(actionName: string, fn: () => ReturnType<MiniProductionService['syncWorkflow']>): void {
    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    fn()
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: (res) => {
          this.work = res;
          this.form = this.toForm(res);
          this.successMessage = `ดำเนินการ ${actionName} สำเร็จ`;
          this.loadHistory();
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, `ดำเนินการ ${actionName} ไม่สำเร็จ`)),
      });
  }

  private toForm(work: MiniProductionResponse): DetailForm {
    return {
      productCode: work.productCode || '',
      productName: work.productName || '',
      qty: Number(work.qty || 0),
      unit: work.unit || 'PCS',
      lineCode: work.lineCode || '',
      priority: (work.priority || 'NORMAL') as MiniProductionPriority,
      dueDate: work.dueDate || '',
      remark: work.remark || '',
    };
  }

  private toUpdatePayload(): MiniProductionUpdateRequest {
    return {
      productCode: this.nullIfBlank(this.form.productCode),
      productName: String(this.form.productName || '').trim(),
      qty: Number(this.form.qty || 0),
      unit: String(this.form.unit || '').trim(),
      lineCode: this.nullIfBlank(this.form.lineCode),
      priority: this.form.priority || 'NORMAL',
      dueDate: this.nullIfBlank(this.form.dueDate),
      remark: this.nullIfBlank(this.form.remark),
    };
  }

  private createEmptyForm(): DetailForm {
    return {
      productCode: '',
      productName: '',
      qty: 1,
      unit: 'PCS',
      lineCode: '',
      priority: 'NORMAL',
      dueDate: '',
      remark: '',
    };
  }

  private nullIfBlank(value: string | null | undefined): string | null {
    const text = String(value || '').trim();
    return text ? text : null;
  }
}
