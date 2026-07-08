import Papa from 'papaparse';
import { AppError } from '@/utils/AppError';
import { RawCsvRow } from '@/schemas/raw-csv-row.schema';

export interface NormalizedCsv {
  headers: string[];
  rows: RawCsvRow[];
}

export class CsvParserService {
  public parseBuffer(buffer: Buffer): NormalizedCsv {
    const csvText = buffer.toString('utf-8').trim();

    if (!csvText) {
      throw AppError.badRequest('CSV file is empty');
    }

    const rawHeaders = this.extractNormalizedHeaders(csvText);

    if (rawHeaders.length === 0) {
      throw AppError.badRequest('CSV file has no headers');
    }

    this.ensureUniqueHeaders(rawHeaders);

    const parsed = Papa.parse<RawCsvRow>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header, index) => this.normalizeHeader(header, index),
    });

    if (parsed.errors.length > 0) {
      const critical = parsed.errors.filter(
        (e) => e.code !== 'UndetectableDelimiter' && e.type !== 'FieldMismatch'
      );

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
      throw AppError.badRequest('CSV file contains headers but no valid data rows');
    }

    return { headers, rows };
  }

  public normalizeRows(rawRows: RawCsvRow[]): RawCsvRow[] {
    return rawRows.map((row) => this.stripEmptyValues(row)).filter((row) => !this.isRowEmpty(row));
  }

  private extractNormalizedHeaders(csvText: string): string[] {
    const headerPreview = Papa.parse<string[]>(csvText, {
      preview: 1,
      header: false,
      skipEmptyLines: false,
    });

    if (headerPreview.errors.length > 0) {
      const critical = headerPreview.errors.filter(
        (e) => e.code !== 'UndetectableDelimiter' && e.type !== 'FieldMismatch'
      );

      if (critical.length > 0) {
        throw AppError.badRequest(`CSV parsing failed: ${critical[0].message}`);
      }
    }

    const firstRow = headerPreview.data[0];

    if (!Array.isArray(firstRow) || firstRow.length === 0) {
      return [];
    }

    return firstRow.map((header, index) => this.normalizeHeader(String(header ?? ''), index));
  }

  private stripEmptyValues(row: RawCsvRow): RawCsvRow {
    const normalized: RawCsvRow = {};

    for (const [key, value] of Object.entries(row)) {
      const trimmedKey = key.trim();
      normalized[trimmedKey] = typeof value === 'string' ? value.trim() : value;
    }

    return normalized;
  }

  private isRowEmpty(row: RawCsvRow): boolean {
    return Object.values(row).every(
      (value) => value === null || value === undefined || value === ''
    );
  }

  private normalizeHeader(header: string, index: number): string {
    const trimmed = header.trim();
    return trimmed || `column_${index + 1}`;
  }

  private ensureUniqueHeaders(headers: string[]): void {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const header of headers) {
      if (seen.has(header) && !duplicates.includes(header)) {
        duplicates.push(header);
      }
      seen.add(header);
    }

    if (duplicates.length > 0) {
      throw AppError.badRequest(`CSV contains duplicate headers: ${duplicates.join(', ')}`);
    }
  }
}

export const csvParserService = new CsvParserService();
