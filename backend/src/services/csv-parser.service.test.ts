import { describe, expect, it } from 'vitest';
import { csvParserService } from '@/services/csv-parser.service';
import { AppError } from '@/utils/AppError';

describe('CsvParserService', () => {
  it('parses a valid CSV buffer successfully', () => {
    const buffer = Buffer.from('Full Name,Email,Phone\nJane Doe,jane@example.com,9876543210');

    const result = csvParserService.parseBuffer(buffer);

    expect(result.headers).toEqual(['Full Name', 'Email', 'Phone']);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({
      'Full Name': 'Jane Doe',
      Email: 'jane@example.com',
      Phone: '9876543210',
    });
  });

  it('throws for an empty CSV file', () => {
    const buffer = Buffer.from('');

    expect(() => csvParserService.parseBuffer(buffer)).toThrowError(AppError);
    expect(() => csvParserService.parseBuffer(buffer)).toThrow('CSV file is empty');
  });

  it('throws for header-only CSV', () => {
    const buffer = Buffer.from('Full Name,Email,Phone\n');

    expect(() => csvParserService.parseBuffer(buffer)).toThrow(
      'CSV file contains headers but no valid data rows'
    );
  });

  it('throws when duplicate headers exist', () => {
    const buffer = Buffer.from('Email,Email,Phone\njane@test.com,other@test.com,12345');

    expect(() => csvParserService.parseBuffer(buffer)).toThrow(
      'CSV contains duplicate headers: Email'
    );
  });
});
