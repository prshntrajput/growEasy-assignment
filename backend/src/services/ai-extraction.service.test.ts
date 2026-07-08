import { describe, expect, it } from 'vitest';
import { aiExtractionService } from '@/services/ai-extraction.service';

describe('AiExtractionService sanitization', () => {
  it('normalizes invalid crm_status values to blank', () => {
    expect(aiExtractionService.normalizeCrmStatus('TRUE')).toBe('');
    expect(aiExtractionService.normalizeCrmStatus('UNKNOWN')).toBe('');
    expect(aiExtractionService.normalizeCrmStatus('SALE_DONE')).toBe('SALE_DONE');
  });

  it('normalizes invalid data_source values to blank', () => {
    expect(aiExtractionService.normalizeDataSource('UNKNOWN')).toBe('');
    expect(aiExtractionService.normalizeDataSource('eden_park')).toBe('eden_park');
  });
});