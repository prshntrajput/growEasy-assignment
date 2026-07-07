import { v4 as uuidv4 } from 'uuid';
import { RawCsvRow } from '@/schemas/raw-csv-row.schema';

export interface CsvBatch {
  jobId: string;
  batchIndex: number;
  totalBatches: number;
  headers: string[];
  rows: RawCsvRow[];
}

const DEFAULT_BATCH_SIZE = 20;

export class BatchService {
  public createBatches(
    headers: string[],
    rows: RawCsvRow[],
    batchSize: number = DEFAULT_BATCH_SIZE
  ): { jobId: string; batches: CsvBatch[] } {
    const jobId = uuidv4();
    const totalBatches = Math.ceil(rows.length / batchSize);
    const batches: CsvBatch[] = [];

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = start + batchSize;
      batches.push({
        jobId,
        batchIndex: i,
        totalBatches,
        headers,
        rows: rows.slice(start, end),
      });
    }

    return { jobId, batches };
  }
}

export const batchService = new BatchService();