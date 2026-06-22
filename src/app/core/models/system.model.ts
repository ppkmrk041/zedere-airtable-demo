export interface ActuatorHealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN' | string;
  components?: Record<string, unknown>;
}

export interface ActuatorInfoResponse {
  app?: Record<string, unknown>;
  build?: Record<string, unknown>;
  git?: Record<string, unknown>;
  [key: string]: unknown;
}
