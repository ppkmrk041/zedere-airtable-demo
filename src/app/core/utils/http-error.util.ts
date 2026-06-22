import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/api.model';

export function extractErrorMessage(error: unknown, fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'): string {
  if (!error) return fallback;

  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiErrorBody | string | null;

    if (typeof body === 'string' && body.trim()) return body.trim();

    if (body && typeof body === 'object') {
      if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
      if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
    }

    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error.trim();

  return fallback;
}
