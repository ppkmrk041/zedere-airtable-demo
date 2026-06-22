export interface AuditLogResponse {
  id: number;
  action: string;
  entityType: string;
  entityId?: string | null;
  actor?: string | null;
  ipAddress?: string | null;
  note?: string | null;
  beforeJson?: string | null;
  afterJson?: string | null;
  createdAt: string;
}
