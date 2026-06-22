export type UserRole = 'USER' | 'MANAGER' | 'ADMIN' | string;

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  fullName: string;
  email: string;
  idCard: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  refreshToken?: string;
  id?: number;
  username?: string;
  fullName?: string;
  role?: UserRole;
  permissions?: string[];
  themePreset?: string;
  themeAccentColor?: string;
  defaultCompanyId?: number | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse extends AuthResponse {
  token: string;
  refreshToken: string;
}

export interface StoredAuthUser {
  id?: number;
  username?: string;
  fullName?: string;
  role?: UserRole;
  permissions?: string[];
  themePreset?: string;
  themeAccentColor?: string;
  defaultCompanyId?: number | null;
}
