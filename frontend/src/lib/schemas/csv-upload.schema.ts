import { z } from 'zod';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const CsvFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'File cannot be empty')
  .refine(
    (file) => file.size <= MAX_FILE_SIZE_BYTES,
    `File must be under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`
  )
  .refine(
    (file) =>
      file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'),
    'File must be a valid CSV'
  );

export type CsvFileInput = z.infer<typeof CsvFileSchema>;
