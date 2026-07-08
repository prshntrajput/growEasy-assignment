import Papa from 'papaparse';
import { AppError } from '@/utils/AppError';
import { RawCsvRow } from '@/schemas/raw-csv-row.schema';

export interface NormalizedCsv {
  headers: string[];
  rows: RawCsvRow[];
}

export class CsvParserService {
  public parseBuffer(buffer: Buffer): NormalizedCsv {
    const csvText = buffer.toString('utf-8');
    const parsed = Papa.parse<RawCsvRow>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      const critical = parsed.errors.filter((e) => e.type !== 'FieldMismatch');
      if (critical.length > 0) {
        throw AppError.badRequest(`CSV parsing failed: ${critical[0].message}`);
      }
    }

    const headers = parsed.meta.fields ?? [];
    if (headers.length === 0) {
      throw AppError.badRequest('CSV file has no headers');
    }

    const rows = this.normalizeRows(parsed.data);

    if (rows.length === 0) {
      throw AppError.badRequest('CSV file has no valid data rows');
    }

    return { headers, rows };
  }

  public normalizeRows(rawRows: RawCsvRow[]): RawCsvRow[] {
    return rawRows.map((row) => this.stripEmptyValues(row)).filter((row) => !this.isRowEmpty(row));
  }

  private stripEmptyValues(row: RawCsvRow): RawCsvRow {
    const normalized: RawCsvRow = {};
    for (const [key, value] of Object.entries(row)) {
      const trimmedKey = key.trim();
      if (typeof value === 'string') {
        normalized[trimmedKey] = value.trim();
      } else {
        normalized[trimmedKey] = value;
      }
    }
    return normalized;
  }

  private isRowEmpty(row: RawCsvRow): boolean {
    return Object.values(row).every(
      (value) => value === null || value === undefined || value === ''
    );
  }
}

export const csvParserService = new CsvParserService();
