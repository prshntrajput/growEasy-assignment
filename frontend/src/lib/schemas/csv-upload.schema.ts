import { z } from 'zod';

export const CsvFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'File cannot be empty')
  .refine((file) => file.size <= 10 * 1024 * 1024, 'File must be under 10MB')
  .refine(
    (file) => file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'),
    'File must be a valid CSV'
  );

export type CsvFileInput = z.infer<typeof CsvFileSchema>;