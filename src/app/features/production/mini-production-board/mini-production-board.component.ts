import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MiniProductionBoardColumnResponse, MiniProductionResponse } from '../../../core/models/mini-production.model';
import { MiniProductionService } from '../../../core/services/mini-production.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-mini-production-board',
  templateUrl: './mini-production-board.component.html',
  styleUrls: ['./mini-production-board.component.css'],
})
export class MiniProductionBoardComponent implements OnInit {
  loading = false;
  errorMessage = '';
  columns: MiniProductionBoardColumnResponse[] = [];

  constructor(
    private api: MiniProductionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api
      .board()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => (this.columns = (res || []).sort((a, b) => a.orderNo - b.orderNo)),
        error: (err) => (this.errorMessage = extractErrorMessage(err, 'โหลด Production Board ไม่สำเร็จ')),
      });
  }

  openWork(work: MiniProductionResponse): void {
    if (!work?.id) return;
    this.router.navigate(['/production/mini-works', work.id]);
  }

  openWorks(): void {
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

  trackColumn(_: number, item: MiniProductionBoardColumnResponse): string {
    return item.stepCode;
  }

  trackWork(_: number, item: MiniProductionResponse): number {
    return item.id;
  }
}
