import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MiniProductionCreateRequest, MiniProductionPriority, MiniProductionResponse } from '../../../core/models/mini-production.model';
import { MiniProductionService } from '../../../core/services/mini-production.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

type WorkForm = {
  productCode: string;
  productName: string;
  qty: number | null;
  unit: string;
  lineCode: string;
  priority: MiniProductionPriority;
  dueDate: string;
  remark: string;
  submitImmediately: boolean;
};

@Component({
  selector: 'app-mini-production-list',
  templateUrl: './mini-production-list.component.html',
  styleUrls: ['./mini-production-list.component.css'],
})
export class MiniProductionListComponent implements OnInit {
  loading = false;
  saving = false;
  submittingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  searchText = '';
  statusFilter = '';
  lineFilter = '';
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  showCreatePanel = false;
  works: MiniProductionResponse[] = [];

  readonly statuses = ['', 'DRAFT', 'IN_PROGRESS', 'HOLD', 'COMPLETED', 'CANCELLED'];
  readonly priorities: MiniProductionPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
  readonly units = ['PCS', 'SET', 'EA', 'M2'];

  form: WorkForm = this.createEmptyForm();

  constructor(
    private api: MiniProductionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.search();
  }

  search(resetPage = true): void {
    if (resetPage) this.page = 0;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api
      .search({
        q: this.searchText,
        status: this.statusFilter,
        lineCode: this.lineFilter,
        page: this.page,
        size: this.size,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.works = res.content || [];
          this.totalElements = res.totalElements || 0;
          this.totalPages = res.totalPages || 0;
          this.page = res.number || 0;
          this.size = res.size || this.size;
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลดรายการใบงานผลิตไม่สำเร็จ')),
      });
  }

  openCreatePanel(): void {
    this.form = this.createEmptyForm();
    this.showCreatePanel = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCreatePanel(): void {
    this.showCreatePanel = false;
  }

  createWork(): void {
    if (this.saving) return;

    const payload = this.toCreatePayload();
    if (!payload.productName || payload.qty <= 0 || !payload.unit) {
      this.errorMessage = 'กรุณากรอก Product Name, Qty และ Unit ให้ครบก่อนสร้างใบงาน';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api
      .create(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (res) => {
          this.successMessage = `สร้างใบงาน ${res.workNo || ''} สำเร็จ`;
          this.showCreatePanel = false;
          this.search(true);
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'สร้างใบงานผลิตไม่สำเร็จ')),
      });
  }

  submitWork(work: MiniProductionResponse): void {
    if (!work?.id || this.submittingId) return;
    if (!window.confirm(`ยืนยันส่งใบงาน ${work.workNo} เข้า MINI_PRODUCTION_FLOW ?`)) return;

    this.submittingId = work.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api
      .submit(work.id, { comment: 'Submit from Mini Production Works' })
      .pipe(finalize(() => (this.submittingId = null)))
      .subscribe({
        next: () => {
          this.successMessage = `ส่งใบงาน ${work.workNo} เข้า Workflow แล้ว`;
          this.load();
        },
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'ส่งใบงานเข้า Workflow ไม่สำเร็จ')),
      });
  }

  openDetail(work: MiniProductionResponse): void {
    if (!work?.id) return;
    this.router.navigate(['/production/mini-works', work.id]);
  }

  openBoard(): void {
    this.router.navigate(['/production/mini-board']);
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) return;
    this.page += 1;
    this.load();
  }

  prevPage(): void {
    if (this.page <= 0) return;
    this.page -= 1;
    this.load();
  }

  statusClass(status: string | null | undefined): string {
    const value = String(status || '').toLowerCase();
    if (value === 'completed') return 'success';
    if (value === 'in_progress') return 'info';
    if (value === 'hold') return 'warning';
    if (value === 'cancelled') return 'danger';
    return 'muted';
  }

  priorityClass(priority: string | null | undefined): string {
    const value = String(priority || '').toLowerCase();
    if (value === 'urgent') return 'danger';
    if (value === 'high') return 'warning';
    if (value === 'low') return 'muted';
    return 'info';
  }

  canSubmit(work: MiniProductionResponse): boolean {
    return String(work.status || '') === 'DRAFT' && !work.workflowInstanceId;
  }

  private toCreatePayload(): MiniProductionCreateRequest {
    return {
      productCode: this.nullIfBlank(this.form.productCode),
      productName: String(this.form.productName || '').trim(),
      qty: Number(this.form.qty || 0),
      unit: String(this.form.unit || '').trim(),
      lineCode: this.nullIfBlank(this.form.lineCode),
      priority: this.form.priority || 'NORMAL',
      dueDate: this.nullIfBlank(this.form.dueDate),
      remark: this.nullIfBlank(this.form.remark),
      submitImmediately: !!this.form.submitImmediately,
    };
  }

  private createEmptyForm(): WorkForm {
    return {
      productCode: '',
      productName: '',
      qty: 1,
      unit: 'PCS',
      lineCode: 'LINE-A',
      priority: 'NORMAL',
      dueDate: '',
      remark: '',
      submitImmediately: false,
    };
  }

  private nullIfBlank(value: string | null | undefined): string | null {
    const text = String(value || '').trim();
    return text ? text : null;
  }
}
