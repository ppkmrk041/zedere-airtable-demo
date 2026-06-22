import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { AdminPermissionService } from '../../../core/services/admin-permission.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  PermissionResponse,
  RolePermissionsResponse,
  UserPermissionOverrideItemRequest,
  UserPermissionOverridesResponse,
} from '../../../core/models/permission.model';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({ selector: 'app-admin-permissions', templateUrl: './admin-permissions.component.html' })
export class AdminPermissionsComponent implements OnInit {
  loading = false;
  savingCatalog = false;
  savingRole = false;
  savingOverride = false;
  permissions: PermissionResponse[] = [];
  roles: RolePermissionsResponse[] = [];
  selectedPermission: PermissionResponse | null = null;
  selectedRole = 'ADMIN';
  userId: number | null = null;
  userOverrides: UserPermissionOverridesResponse | null = null;
  rolePermissionSet = new Set<string>();
  overrideMap = new Map<string, boolean>();

  catalogForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    categoryKey: ['', [Validators.required, Validators.maxLength(100)]],
    categoryName: ['', [Validators.required, Validators.maxLength(200)]],
    active: [true],
    systemDefined: [false],
  });

  constructor(private fb: FormBuilder, private permissionService: AdminPermissionService, public authService: AuthService) {}

  ngOnInit(): void { this.load(); }

  canEditCatalog(): boolean { return this.authService.hasPermission('ADMIN_PERMISSION_EDIT'); }
  canEditRole(): boolean { return this.authService.hasPermission('ADMIN_ROLE_PERMISSION_EDIT'); }
  canEditOverride(): boolean { return this.authService.hasPermission('ADMIN_USER_PERMISSION_EDIT'); }

  load(): void {
    this.loading = true;
    forkJoin({ permissions: this.permissionService.listPermissions(), roles: this.permissionService.listRolePermissions() })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ permissions, roles }) => {
          this.permissions = permissions ?? [];
          this.roles = roles ?? [];
          this.pickRole(this.selectedRole);
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'โหลดสิทธิ์ไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }

  selectPermission(row: PermissionResponse): void {
    this.selectedPermission = row;
    this.catalogForm.patchValue({
      code: row.code,
      name: row.name,
      description: row.description ?? '',
      categoryKey: row.categoryKey,
      categoryName: row.categoryName,
      active: row.active,
      systemDefined: row.systemDefined,
    });
    this.catalogForm.get('code')?.disable();
  }

  newPermission(): void {
    this.selectedPermission = null;
    this.catalogForm.reset({ code: '', name: '', description: '', categoryKey: '', categoryName: '', active: true, systemDefined: false });
    this.catalogForm.get('code')?.enable();
  }

  saveCatalog(): void {
    if (this.catalogForm.invalid || this.savingCatalog || !this.canEditCatalog()) {
      this.catalogForm.markAllAsTouched();
      return;
    }

    this.savingCatalog = true;
    const raw = this.catalogForm.getRawValue();
    const request$ = this.selectedPermission
      ? this.permissionService.updatePermission(this.selectedPermission.id, {
          name: String(raw.name ?? '').trim(),
          description: String(raw.description ?? '').trim(),
          categoryKey: String(raw.categoryKey ?? '').trim(),
          categoryName: String(raw.categoryName ?? '').trim(),
          active: Boolean(raw.active),
        })
      : this.permissionService.createPermission({
          code: String(raw.code ?? '').trim().toUpperCase(),
          name: String(raw.name ?? '').trim(),
          description: String(raw.description ?? '').trim(),
          categoryKey: String(raw.categoryKey ?? '').trim(),
          categoryName: String(raw.categoryName ?? '').trim(),
          systemDefined: Boolean(raw.systemDefined),
        });

    request$
      .pipe(finalize(() => (this.savingCatalog = false)))
      .subscribe({
        next: () => {
          this.load();
          this.newPermission();
          Swal.fire({ icon: 'success', title: 'บันทึกสิทธิ์สำเร็จ', timer: 1000, showConfirmButton: false });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'บันทึกสิทธิ์ไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }

  pickRole(role: string): void {
    this.selectedRole = role;
    const found = this.roles.find((r) => r.role === role);
    this.rolePermissionSet = new Set(found?.permissions ?? []);
  }

  toggleRolePermission(code: string, checked: boolean): void {
    checked ? this.rolePermissionSet.add(code) : this.rolePermissionSet.delete(code);
  }

  saveRole(): void {
    if (!this.canEditRole() || this.savingRole) return;
    this.savingRole = true;
    this.permissionService.replaceRolePermissions(this.selectedRole, { permissions: Array.from(this.rolePermissionSet).sort() })
      .pipe(finalize(() => (this.savingRole = false)))
      .subscribe({
        next: () => {
          this.load();
          Swal.fire({ icon: 'success', title: 'บันทึก Role สำเร็จ', timer: 1000, showConfirmButton: false });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'บันทึก Role ไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }

  loadUserOverrides(): void {
    if (!this.userId) return;
    this.permissionService.getUserOverrides(this.userId).subscribe({
      next: (res) => {
        this.userOverrides = res;
        this.overrideMap = new Map(res.overrides.map((o) => [o.code, o.allowed]));
      },
      error: (err) => Swal.fire({ icon: 'error', title: 'โหลด User Override ไม่สำเร็จ', text: extractErrorMessage(err) }),
    });
  }

  setOverride(code: string, value: string): void {
    if (value === 'INHERIT') {
      this.overrideMap.delete(code);
      return;
    }
    this.overrideMap.set(code, value === 'ALLOW');
  }

  getOverrideValue(code: string): string {
    if (!this.overrideMap.has(code)) return 'INHERIT';
    return this.overrideMap.get(code) ? 'ALLOW' : 'DENY';
  }

  saveOverrides(): void {
    if (!this.userId || !this.canEditOverride() || this.savingOverride) return;
    const overrides: UserPermissionOverrideItemRequest[] = Array.from(this.overrideMap.entries()).map(([code, allowed]) => ({ code, allowed }));

    this.savingOverride = true;
    this.permissionService.replaceUserOverrides(this.userId, { overrides })
      .pipe(finalize(() => (this.savingOverride = false)))
      .subscribe({
        next: (res) => {
          this.userOverrides = res;
          Swal.fire({ icon: 'success', title: 'บันทึก Override สำเร็จ', timer: 1000, showConfirmButton: false });
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'บันทึก Override ไม่สำเร็จ', text: extractErrorMessage(err) }),
      });
  }
}
