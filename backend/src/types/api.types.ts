export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface ImportResultSummary {
  imported: import('@/schemas/crm-record.schema').CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
}

export interface SkippedRecord {
  originalRow: Record<string, unknown>;
  reason: string;
}

export interface JobStatus {
  jobId: string;
  status: 'processing' | 'done' | 'failed';
  progress: number;
  totalBatches?: number;
  completedBatches?: number;
  result?: ImportResultSummary;
  error?: string;
}