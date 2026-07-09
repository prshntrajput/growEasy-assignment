import { describe, expect, it } from 'vitest';
import { resultAggregatorService } from '../../src/services/result-aggregator.service';
import { AiExtractedRecord } from '../../src/services/ai-extraction.service';

describe('ResultAggregatorService', () => {
  it('skips records flagged by AI and imports valid records', () => {
    const extractedBatches: AiExtractedRecord[][] = [
      [
        {
          _skip: false,
          created_at: '',
          name: 'Priya Verma',
          email: 'priya@test.com',
          country_code: '+91',
          mobile_without_country_code: '9123456789',
          company: '',
          city: '',
          state: '',
          country: '',
          lead_owner: '',
          crm_status: 'SALE_DONE',
          crm_note: 'Onboarding started',
          data_source: '',
          possession_time: '',
          description: '',
        },
        {
          _skip: true,
          _skip_reason: 'No email or mobile number found',
          created_at: '',
          name: 'No Contact',
          email: '',
          country_code: '',
          mobile_without_country_code: '',
          company: '',
          city: '',
          state: '',
          country: '',
          lead_owner: '',
          crm_status: '',
          crm_note: '',
          data_source: '',
          possession_time: '',
          description: '',
        },
      ],
    ];

    const originalRows = [
      [
        { FullName: 'Priya Verma', Email: 'priya@test.com' },
        { FullName: 'No Contact', Email: '' },
      ],
    ];

    const result = resultAggregatorService.aggregate(extractedBatches, originalRows);

    expect(result.totalImported).toBe(1);
    expect(result.totalSkipped).toBe(1);
    expect(result.imported[0].name).toBe('Priya Verma');
    expect(result.skipped[0].reason).toBe('No email or mobile number found');
    expect(result.imported[0].created_at).toBeTruthy();
  });
});
