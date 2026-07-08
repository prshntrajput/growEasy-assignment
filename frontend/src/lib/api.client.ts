import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';
import { CrmRecord } from '@/lib/schemas/crm-record.schema';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface SkippedRecord {
  originalRow: Record<string, unknown>;
  reason: string;
}

export interface ImportResultSummary {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
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

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  if (!json?.success) {
    throw new ApiError(
      json?.message || 'Unexpected response format',
      res.status
    );
  }

  return json.data as T;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/ping`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const formData = new FormData();
  formData.append('file', file);

  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/api/csv/parse`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new ApiError('Network error while uploading CSV', 0);
  }

  return handleResponse(res);
}

export async function confirmImport(
  parsedCsv: ParsedCsv
): Promise<{ jobId: string; totalBatches: number; totalRows: number }> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headers: parsedCsv.headers,
        rows: parsedCsv.rows,
      }),
    });
  } catch {
    throw new ApiError('Network error — could not reach the server', 0);
  }

  return handleResponse(res);
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/api/import/${jobId}/status`);
  } catch {
    throw new ApiError('Network error — could not reach the server', 0);
  }

  return handleResponse(res);
}

export { API_BASE_URL };
