// ไฟล์: src/app/features/system/system-health/system-health.component.ts

import { Component, OnInit } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';

import { SystemService } from '../../../core/services/system.service';
import { ActuatorHealthResponse, ActuatorInfoResponse } from '../../../core/models/system.model';

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.css'],
})
export class SystemHealthComponent implements OnInit {
  loading = false;
  health: ActuatorHealthResponse | null = null;
  info: ActuatorInfoResponse | null = null;
  errorMessage = '';

  constructor(private systemService: SystemService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';

    forkJoin({ health: this.systemService.health(), info: this.systemService.info() })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ health, info }) => {
          this.health = health;
          this.info = info;
        },
        error: () => {
          this.errorMessage = 'ไม่สามารถเชื่อมต่อ Actuator ได้';
          this.health = null;
          this.info = null;
        },
      });
  }

  json(value: unknown): string {
    return JSON.stringify(value ?? {}, null, 2);
  }
}
