import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { MeService } from '../../core/services/me.service';
import { ThemeService } from '../../core/services/theme.service';
import { extractErrorMessage } from '../../core/utils/http-error.util';
import { MeResponse } from '../../core/models/user.model';

@Component({ selector: 'app-profile', templateUrl: './profile.component.html' })
export class ProfileComponent implements OnInit {
  loading = false;
  saving = false;
  me: MeResponse | null = null;
  themeOptions = this.themeService.getThemeOptions();

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    themePreset: ['OCEAN', [Validators.required]],
    themeAccentColor: ['#2563EB', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6})$/)]],
  });

  constructor(private fb: FormBuilder, private meService: MeService, private themeService: ThemeService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.meService.me()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (me) => {
          this.me = me;
          this.form.patchValue({
            fullName: me.fullName,
            email: me.email,
            themePreset: me.themePreset || 'OCEAN',
            themeAccentColor: me.themeAccentColor || '#2563EB',
          });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'โหลด Profile ไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.meService.updateMe({
      fullName: String(this.form.value.fullName ?? '').trim(),
      email: String(this.form.value.email ?? '').trim(),
      themePreset: String(this.form.value.themePreset ?? 'OCEAN'),
      themeAccentColor: String(this.form.value.themeAccentColor ?? '#2563EB'),
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (me) => {
          this.me = me;
          Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1000, showConfirmButton: false });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }
}
