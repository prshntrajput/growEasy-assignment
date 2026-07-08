import { AiExtractedRecord } from '@/services/ai-extraction.service';
import { CrmRecordSchema } from '@/schemas/crm-record.schema';
import { ImportResultSummary, SkippedRecord } from '@/types/api.types';
import { RawCsvRow } from '@/schemas/raw-csv-row.schema';

export class ResultAggregatorService {
  public aggregate(
    extractedBatches: AiExtractedRecord[][],
    originalRows: RawCsvRow[][]
  ): ImportResultSummary {
    const imported: ImportResultSummary['imported'] = [];
    const skipped: SkippedRecord[] = [];

    extractedBatches.forEach((batch, batchIdx) => {
      batch.forEach((record, rowIdx) => {
        const { _skip, _skip_reason, ...crmFields } = record;

        if (_skip) {
          skipped.push({
            originalRow: originalRows[batchIdx]?.[rowIdx] ?? {},
            reason: _skip_reason || 'No email or mobile number found',
          });
          return;
        }

        const normalizedFields = this.sanitizePlainTextFields(
          this.applyFallbacks(crmFields)
        );

        const validation = CrmRecordSchema.safeParse(normalizedFields);

        if (!validation.success) {
          skipped.push({
            originalRow: originalRows[batchIdx]?.[rowIdx] ?? {},
            reason: `Failed CRM schema validation: ${validation.error.issues[0]?.message}`,
          });
          return;
        }

        imported.push(validation.data);
      });
    });

    return {
      imported,
      skipped,
      totalImported: imported.length,
      totalSkipped: skipped.length,
    };
  }

  private applyFallbacks(fields: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...fields };

    if (!normalized.created_at || normalized.created_at === '') {
      normalized.created_at = new Date().toISOString();
    }

    return normalized;
  }

  private sanitizePlainTextFields(
    fields: Record<string, unknown>
  ): Record<string, unknown> {
    const normalized = { ...fields };

    const plainTextKeys = [
      'crm_note',
      'description',
      'name',
      'company',
      'city',
      'state',
      'country',
      'lead_owner',
    ];

    for (const key of plainTextKeys) {
      const value = normalized[key];

      if (typeof value === 'string') {
        normalized[key] = value
          .replace(/\[([^\]]+)\]\(mailto:[^)]+\)/gi, '$1')
          .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    return normalized;
  }
}

export const resultAggregatorService = new ResultAggregatorService();