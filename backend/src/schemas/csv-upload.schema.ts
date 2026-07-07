import { z } from 'zod';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];

export const CsvUploadFileSchema = z.object({
  originalname: z.string().refine((name) => name.toLowerCase().endsWith('.csv'), {
    message: 'File must have a .csv extension',
  }),
  mimetype: z
    .string()
    .refine((type) => ALLOWED_MIME_TYPES.includes(type) || type === 'text/plain', {
      message: 'Invalid file type. Only CSV files are allowed',
    }),
  size: z
    .number()
    .min(1, 'File cannot be empty')
    .max(MAX_FILE_SIZE_BYTES, `File must not exceed ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`),
  buffer: z.instanceof(Buffer, { message: 'File buffer is missing or corrupted' }),
});

export type CsvUploadFile = z.infer<typeof CsvUploadFileSchema>;
