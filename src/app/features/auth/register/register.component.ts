import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css'],
})
export class RegisterComponent {
  loading = false;
  hidePassword = true;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    idCard: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(80)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService
      .register({
        fullName: String(this.form.value.fullName ?? '').trim(),
        email: String(this.form.value.email ?? '').trim(),
        idCard: String(this.form.value.idCard ?? '').trim(),
        username: String(this.form.value.username ?? '').trim(),
        password: String(this.form.value.password ?? ''),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'สมัครสมาชิกสำเร็จ',
            timer: 1100,
            showConfirmButton: false,
          });
          this.router.navigate(['/login']);
        },
        error: (err: unknown) => {
          Swal.fire({
            icon: 'error',
            title: 'สมัครสมาชิกไม่สำเร็จ',
            text: extractErrorMessage(err),
            confirmButtonText: 'ตกลง',
          });
        },
      });
  }
}
