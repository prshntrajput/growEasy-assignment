import { z } from 'zod';

export const RawCsvRowSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.null(), z.undefined()])
);

export const RawCsvDataSchema = z.object({
  headers: z.array(z.string().trim().min(1)).min(1, 'CSV must contain at least one header column'),
  rows: z
    .array(RawCsvRowSchema)
    .min(1, 'CSV must contain at least one data row')
    .max(50000, 'CSV exceeds maximum supported rows (50,000)'),
});

export type RawCsvRow = z.infer<typeof RawCsvRowSchema>;
export type RawCsvData = z.infer<typeof RawCsvDataSchema>;
