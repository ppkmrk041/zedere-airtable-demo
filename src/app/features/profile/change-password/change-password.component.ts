import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { MeService } from '../../../core/services/me.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({ selector: 'app-change-password', templateUrl: './change-password.component.html' })
export class ChangePasswordComponent {
  saving = false;
  form = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private meService: MeService) {}

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const newPassword = String(this.form.value.newPassword ?? '');
    const confirmPassword = String(this.form.value.confirmPassword ?? '');

    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'รหัสผ่านไม่ตรงกัน' });
      return;
    }

    this.saving = true;
    this.meService.changePassword({
      currentPassword: String(this.form.value.currentPassword ?? ''),
      newPassword,
      confirmPassword,
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.form.reset();
          Swal.fire({ icon: 'success', title: 'เปลี่ยนรหัสผ่านสำเร็จ', timer: 1200, showConfirmButton: false });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'เปลี่ยนรหัสผ่านไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }
}
