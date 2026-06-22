export type WorkflowInstanceStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "PENDING_APPROVAL"
  | "RETURNED"
  | "REJECTED"
  | "HOLD"
  | "CANCELLED"
  | "COMPLETED";

export type WorkflowTaskStatus =
  | "OPEN"
  | "CLAIMED"
  | "DONE"
  | "CANCELLED"
  | "SKIPPED";

export type WorkflowActionCode =
  | "CREATE"
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "RETURN_TO_PREVIOUS"
  | "RETURN_TO_STEP"
  | "HOLD"
  | "RELEASE"
  | "CANCEL"
  | "REOPEN"
  | "COMPLETE";

export interface WorkflowDefinitionResponse {
  id: number;
  workflowCode: string;
  workflowName: string;
  moduleCode?: string | null;
  description?: string | null;
  active: boolean;
  allowReturnPrevious?: boolean;
  allowReturnAnyStep?: boolean;
  allowCancel?: boolean;
  versionNo?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WorkflowDefinitionRequest {
  workflowCode: string;
  workflowName: string;
  moduleCode?: string | null;
  description?: string | null;
  active: boolean;
  allowReturnPrevious: boolean;
  allowReturnAnyStep: boolean;
  allowCancel: boolean;
}

export interface WorkflowStepResponse {
  id: number;
  definitionId?: number | null;
  stepCode: string;
  stepName: string;
  stepOrder: number;
  stepType?: string | null;
  approverType?: string | null;
  approverRole?: string | null;
  approverUserId?: number | null;
  requiredAllApprover?: boolean;
  allowEditDocument?: boolean;
  allowReturn?: boolean;
  allowReject?: boolean;
  allowHold?: boolean;
  active: boolean;
}

export interface WorkflowStepRequest {
  stepCode: string;
  stepName: string;
  stepOrder: number;
  stepType: string;
  approverType: string;
  approverRole?: string | null;
  approverUserId?: number | null;
  requiredAllApprover: boolean;
  allowEditDocument: boolean;
  allowReturn: boolean;
  allowReject: boolean;
  allowHold: boolean;
  active: boolean;
}

export interface WorkflowInstanceResponse {
  id: number;
  workflowCode: string;
  documentType: string;
  documentId?: number | null;
  documentNo: string;
  documentTitle?: string | null;
  currentStepCode?: string | null;
  currentStepName?: string | null;
  status: WorkflowInstanceStatus | string;
  requesterId?: number | null;
  requesterName?: string | null;
  submittedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WorkflowTaskResponse {
  id: number;
  instanceId: number;
  stepId?: number | null;
  taskStatus: WorkflowTaskStatus | string;
  assignedUserId?: number | null;
  assignedRole?: string | null;
  assignedToName?: string | null;
  actionRequired?: string | null;
  dueAt?: string | null;
  claimedBy?: string | null;
  claimedAt?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;

  workflowCode?: string | null;
  documentType?: string | null;
  documentNo?: string | null;
  documentTitle?: string | null;
  currentStepCode?: string | null;
  currentStepName?: string | null;
  instanceStatus?: string | null;
}

export interface WorkflowHistoryResponse {
  id: number;
  instanceId: number;
  fromStepCode?: string | null;
  fromStepName?: string | null;
  toStepCode?: string | null;
  toStepName?: string | null;
  actionCode: WorkflowActionCode | string;
  actionName?: string | null;
  actorId?: number | null;
  actorUsername?: string | null;
  actorFullName?: string | null;
  comment?: string | null;
  reasonCode?: string | null;
  createdAt?: string | null;
}

export interface WorkflowStartRequest {
  workflowCode: string;
  documentType: string;
  documentId?: number | null;
  documentNo?: string | null;
  documentTitle?: string | null;
}

export interface WorkflowActionRequest {
  comment?: string | null;
  reasonCode?: string | null;

  /**
   * รองรับของเดิมชั่วคราว เพื่อไม่ให้ component เก่าพัง
   * Backend จริงใช้ stepCode ผ่าน WorkflowReturnStepRequest
   */
  targetStepCode?: string | null;
}

export interface WorkflowReturnStepRequest {
  stepId?: number | null;
  stepCode: string;
  comment?: string | null;
  reasonCode?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}