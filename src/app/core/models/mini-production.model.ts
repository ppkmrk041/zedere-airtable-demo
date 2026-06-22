export type MiniProductionStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type MiniProductionPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface MiniProductionResponse {
  id: number;
  workNo: string;
  productCode?: string | null;
  productName: string;
  qty: number;
  unit: string;
  lineCode?: string | null;
  priority: MiniProductionPriority | string;
  status: MiniProductionStatus | string;
  dueDate?: string | null;
  workflowInstanceId?: number | null;
  workflowStatus?: string | null;
  workflowStepCode?: string | null;
  workflowStepName?: string | null;
  remark?: string | null;
  active: boolean;
  submittedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface MiniProductionCreateRequest {
  productCode?: string | null;
  productName: string;
  qty: number;
  unit: string;
  lineCode?: string | null;
  priority: MiniProductionPriority | string;
  dueDate?: string | null;
  remark?: string | null;
  submitImmediately: boolean;
}

export interface MiniProductionUpdateRequest {
  productCode?: string | null;
  productName: string;
  qty: number;
  unit: string;
  lineCode?: string | null;
  priority: MiniProductionPriority | string;
  dueDate?: string | null;
  remark?: string | null;
}

export interface MiniProductionSubmitRequest {
  comment?: string | null;
}

export interface MiniProductionCancelRequest {
  comment?: string | null;
  reasonCode?: string | null;
}

export interface MiniProductionHistoryResponse {
  id: number;
  workId: number;
  workNo: string;
  actionCode: string;
  actionName?: string | null;
  fromStatus?: string | null;
  toStatus?: string | null;
  fromStepCode?: string | null;
  toStepCode?: string | null;
  actorUsername?: string | null;
  actorFullName?: string | null;
  comment?: string | null;
  createdAt?: string | null;
}

export interface MiniProductionBoardColumnResponse {
  stepCode: string;
  stepName: string;
  orderNo: number;
  total: number;
  works: MiniProductionResponse[];
}

export interface MiniProductionSearchParams {
  q?: string | null;
  status?: string | null;
  lineCode?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}
