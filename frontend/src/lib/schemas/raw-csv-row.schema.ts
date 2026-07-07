import { z } from 'zod';

export const RawCsvRowSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.null(), z.undefined()])
);

export const ParsedCsvSchema = z.object({
  headers: z.array(z.string()).min(1, 'No headers found in CSV'),
  rows: z.array(RawCsvRowSchema).min(1, 'No data rows found in CSV'),
});

export type RawCsvRow = z.infer<typeof RawCsvRowSchema>;
export type ParsedCsv = z.infer<typeof ParsedCsvSchema>;
