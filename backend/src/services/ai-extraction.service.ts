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

  private sanitizeEnumFields(record: AiExtractedRecord): AiExtractedRecord {
    const sanitized: AiExtractedRecord = { ...record };

    if (sanitized.crm_status && !VALID_CRM_STATUSES.has(sanitized.crm_status)) {
      console.warn(`Invalid crm_status "${sanitized.crm_status}" received, clearing to blank`);
      sanitized.crm_status = '';
    }

    if (sanitized.data_source && !VALID_DATA_SOURCES.has(sanitized.data_source)) {
      console.warn(`Invalid data_source "${sanitized.data_source}" received, clearing to blank`);
      sanitized.data_source = '';
    }

    return sanitized;
  }
}

export const aiExtractionService = new AiExtractionService();
