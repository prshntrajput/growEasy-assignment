import { getGeminiModel } from '@/config/gemini.client';
import { promptBuilderService } from '@/services/prompt-builder.service';
import { RawCsvRow } from '@/schemas/raw-csv-row.schema';
import { CrmRecord, CrmStatusEnum, DataSourceEnum } from '@/schemas/crm-record.schema';
import { AppError } from '@/utils/AppError';

export interface AiExtractedRecord extends CrmRecord {
  _skip: boolean;
  _skip_reason?: string;
}

interface GeminiExtractionResponse {
  records: AiExtractedRecord[];
}

const VALID_CRM_STATUSES = new Set<string>(CrmStatusEnum.options);
const VALID_DATA_SOURCES = new Set<string>(DataSourceEnum.options);

const MEANINGLESS_CRM_STATUS_VALUES = new Set<string>([
  'TRUE',
  'FALSE',
  '1',
  '0',
  'NULL',
  'N/A',
  'NA',
  'UNKNOWN',
]);

export class AiExtractionService {
  public async extractBatch(headers: string[], rows: RawCsvRow[]): Promise<AiExtractedRecord[]> {
    const model = getGeminiModel();
    const prompt = promptBuilderService.buildExtractionPrompt(headers, rows);

    let rawText: string;

    try {
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
    } catch (err) {
      throw AppError.aiProviderError(
        `Gemini API request failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }

    let parsed: GeminiExtractionResponse;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw AppError.unprocessableAI('AI returned malformed JSON', {
        rawText: rawText.slice(0, 500),
      });
    }

    if (!Array.isArray(parsed.records)) {
      throw AppError.unprocessableAI('AI response missing "records" array', {
        parsed,
      });
    }

    if (parsed.records.length !== rows.length) {
      console.warn(`Batch mismatch: expected ${rows.length} records, got ${parsed.records.length}`);
    }

    return parsed.records.map((record) => this.sanitizeEnumFields(record));
  }

  public sanitizeEnumFields(record: AiExtractedRecord): AiExtractedRecord {
    const sanitized: AiExtractedRecord = { ...record };

    sanitized.crm_status = this.normalizeCrmStatus(
      sanitized.crm_status
    ) as AiExtractedRecord['crm_status'];

    sanitized.data_source = this.normalizeDataSource(
      sanitized.data_source
    ) as AiExtractedRecord['data_source'];

    return sanitized;
  }

  public normalizeCrmStatus(value: string | undefined): string {
    if (!value) return '';

    const normalized = value.trim().toUpperCase();

    if (VALID_CRM_STATUSES.has(normalized)) {
      return normalized;
    }

    if (MEANINGLESS_CRM_STATUS_VALUES.has(normalized)) {
      return '';
    }

    return '';
  }

  public normalizeDataSource(value: string | undefined): string {
    if (!value) return '';

    const normalized = value.trim().toLowerCase();

    if (VALID_DATA_SOURCES.has(normalized)) {
      return normalized;
    }

    return '';
  }
}

export const aiExtractionService = new AiExtractionService();
