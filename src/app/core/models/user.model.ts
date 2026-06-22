export interface MeResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  idCard: string;
  role: string;
  permissions?: string[];
  enabled: boolean;
  lastLoginAt?: string | null;
  passwordUpdatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  themePreset?: string | null;
  themeAccentColor?: string | null;
  defaultCompanyId?: number | null;
}

export interface MeUpdateRequest {
  fullName: string;
  email: string;
  themePreset: string;
  themeAccentColor: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminUserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  idCard: string;
  role: string;
  enabled: boolean;
  failedLoginCount: number;
  lockUntil?: string | null;
  lastLoginAt?: string | null;
  passwordUpdatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  themePreset?: string | null;
  themeAccentColor?: string | null;
}

export interface AdminUserUpdateRequest {
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
  themePreset: string;
  themeAccentColor: string;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}
