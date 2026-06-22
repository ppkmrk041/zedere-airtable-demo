import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { AdminUserService } from '../../../core/services/admin-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AdminUserResponse } from '../../../core/models/user.model';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({ selector: 'app-admin-users', templateUrl: './admin-users.component.html' })
export class AdminUsersComponent implements OnInit {
  loading = false;
  saving = false;
  users: AdminUserResponse[] = [];
  selected: AdminUserResponse | null = null;
  pageIndex = 0;
  pageSize = 20;
  total = 0;
  readonly roles = ['USER', 'MANAGER', 'ADMIN'];
  readonly themeOptions = this.themeService.getThemeOptions();

  filterForm = this.fb.group({ q: [''], role: [''], enabled: [''] });
  editForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    role: ['USER', [Validators.required]],
    enabled: [true, [Validators.required]],
    themePreset: ['OCEAN', [Validators.required]],
    themeAccentColor: ['#2563EB', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6})$/)]],
  });

  constructor(
    private fb: FormBuilder,
    private userService: AdminUserService,
    public authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void { this.load(0); }

  canEdit(): boolean { return this.authService.hasPermission('ADMIN_USER_EDIT'); }
  canReset(): boolean { return this.authService.hasPermission('ADMIN_USER_RESET_PASSWORD'); }
  canLock(): boolean { return this.authService.hasPermission('ADMIN_USER_LOCK'); }
  canUnlock(): boolean { return this.authService.hasPermission('ADMIN_USER_UNLOCK'); }

  load(page = this.pageIndex): void {
    this.loading = true;
    this.pageIndex = page;
    const enabledRaw = this.filterForm.value.enabled;
    const enabled = enabledRaw === '' || enabledRaw === null || enabledRaw === undefined ? null : String(enabledRaw) === 'true';

    this.userService.listUsers({
      q: String(this.filterForm.value.q ?? '').trim(),
      role: String(this.filterForm.value.role ?? '').trim(),
      enabled,
      page: this.pageIndex,
      size: this.pageSize,
      sort: 'id,desc',
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.users = res.content ?? [];
          this.total = res.totalElements ?? 0;
          this.pageIndex = res.number ?? 0;
          this.pageSize = res.size ?? this.pageSize;
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'โหลดผู้ใช้ไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }

  select(row: AdminUserResponse): void {
    this.selected = row;
    this.editForm.patchValue({
      fullName: row.fullName,
      email: row.email,
      role: row.role,
      enabled: row.enabled,
      themePreset: row.themePreset || 'OCEAN',
      themeAccentColor: row.themeAccentColor || '#2563EB',
    });
  }

  save(): void {
    if (!this.selected || this.editForm.invalid || this.saving || !this.canEdit()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.userService.updateUser(this.selected.id, {
      fullName: String(this.editForm.value.fullName ?? '').trim(),
      email: String(this.editForm.value.email ?? '').trim(),
      role: String(this.editForm.value.role ?? 'USER'),
      enabled: Boolean(this.editForm.value.enabled),
      themePreset: String(this.editForm.value.themePreset ?? 'OCEAN'),
      themeAccentColor: String(this.editForm.value.themeAccentColor ?? '#2563EB'),
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (user) => {
          this.selected = user;
          this.load(this.pageIndex);
          Swal.fire({ icon: 'success', title: 'บันทึกผู้ใช้สำเร็จ', timer: 1000, showConfirmButton: false });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }

  async resetPassword(row: AdminUserResponse): Promise<void> {
    if (!this.canReset()) return;
    const result = await Swal.fire({
      title: `Reset Password: ${row.username}`,
      input: 'password',
      inputLabel: 'New password',
      inputPlaceholder: 'อย่างน้อย 6 ตัวอักษร',
      showCancelButton: true,
      confirmButtonText: 'Reset',
      inputValidator: (value) => !value || value.length < 6 ? 'รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร' : null,
    });
    if (!result.isConfirmed || !result.value) return;

    this.userService.resetPassword(row.id, { newPassword: result.value, confirmPassword: result.value }).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Reset สำเร็จ', timer: 1000, showConfirmButton: false }),
      error: (err) => Swal.fire({ icon: 'error', title: 'Reset ไม่สำเร็จ', text: extractErrorMessage(err) }),
    });
  }

  async lock(row: AdminUserResponse): Promise<void> {
    if (!this.canLock()) return;
    const result = await Swal.fire({
      title: `Lock user: ${row.username}`,
      input: 'number',
      inputValue: 15,
      inputLabel: 'จำนวนนาที',
      showCancelButton: true,
      confirmButtonText: 'Lock',
    });
    if (!result.isConfirmed) return;

    this.userService.lockUser(row.id, Number(result.value || 15)).subscribe({
      next: () => {
        this.load(this.pageIndex);
        Swal.fire({ icon: 'success', title: 'ล็อกสำเร็จ', timer: 1000, showConfirmButton: false });
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'ล็อกไม่สำเร็จ', text: extractErrorMessage(err) }),
    });
  }

  unlock(row: AdminUserResponse): void {
    if (!this.canUnlock()) return;
    this.userService.unlockUser(row.id).subscribe({
      next: () => {
        this.load(this.pageIndex);
        Swal.fire({ icon: 'success', title: 'ปลดล็อกสำเร็จ', timer: 1000, showConfirmButton: false });
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'ปลดล็อกไม่สำเร็จ', text: extractErrorMessage(err) }),
    });
  }
}
