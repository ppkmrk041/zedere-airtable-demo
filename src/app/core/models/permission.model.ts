export interface PermissionResponse {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  categoryKey: string;
  categoryName: string;
  systemDefined: boolean;
  active: boolean;
}

export interface PermissionCreateRequest {
  code: string;
  name: string;
  description?: string | null;
  categoryKey: string;
  categoryName: string;
  systemDefined?: boolean;
}

export interface PermissionUpdateRequest {
  name: string;
  description?: string | null;
  categoryKey: string;
  categoryName: string;
  active: boolean;
}

export interface RolePermissionsResponse {
  role: string;
  permissions: string[];
}

export interface RolePermissionsUpdateRequest {
  permissions: string[];
}

export interface UserPermissionOverrideItemRequest {
  code: string;
  allowed: boolean;
}

export interface UserPermissionOverridesUpdateRequest {
  overrides: UserPermissionOverrideItemRequest[];
}

export interface UserPermissionOverrideItemResponse {
  code: string;
  name: string;
  allowed: boolean;
}

export interface UserPermissionOverridesResponse {
  userId: number;
  username: string;
  role: string;
  overrides: UserPermissionOverrideItemResponse[];
}

export interface EffectivePermissionsResponse {
  userId: number;
  username: string;
  role: string;
  permissions: string[];
}
