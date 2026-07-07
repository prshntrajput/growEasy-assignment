import { z } from 'zod';
import { RawCsvRowSchema } from './raw-csv-row.schema';

export const BatchRequestSchema = z.object({
  jobId: z.string().uuid('jobId must be a valid UUID'),
  batchIndex: z.number().int().nonnegative(),
  totalBatches: z.number().int().positive(),
  headers: z.array(z.string()).min(1),
  rows: z.array(RawCsvRowSchema).min(1).max(50, 'Batch size must not exceed 50 rows'),
});

export const ImportRequestSchema = z.object({
  headers: z.array(z.string().trim().min(1)).min(1, 'CSV must contain at least one header'),
  rows: z
    .array(RawCsvRowSchema)
    .min(1, 'At least one row is required')
    .max(50000, 'CSV exceeds maximum supported rows'),
});

export type BatchRequest = z.infer<typeof BatchRequestSchema>;
export type ImportRequest = z.infer<typeof ImportRequestSchema>;
