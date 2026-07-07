import Papa from 'papaparse';
import {
  ParsedCsv,
  ParsedCsvSchema,
  RawCsvRow,
} from '@/lib/schemas/raw-csv-row.schema';

export interface CsvParseResult {
  success: boolean;
  data?: ParsedCsv;
  error?: string;
}

export function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (e) => e.type !== 'FieldMismatch'
          );
          if (criticalErrors.length > 0) {
            resolve({
              success: false,
              error: `CSV parsing failed: ${criticalErrors[0].message}`,
            });
            return;
          }
        }

        const headers = results.meta.fields ?? [];
        const rows = results.data as RawCsvRow[];

        const validation = ParsedCsvSchema.safeParse({ headers, rows });

        if (!validation.success) {
          resolve({
            success: false,
            error:
              validation.error.issues[0]?.message ?? 'Invalid CSV structure',
          });
          return;
        }

        resolve({ success: true, data: validation.data });
      },
      error: (err) => {
        resolve({
          success: false,
          error: `Failed to read file: ${err.message}`,
        });
      },
    });
  });
}
