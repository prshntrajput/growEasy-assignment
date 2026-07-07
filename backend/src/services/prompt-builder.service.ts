import { RawCsvRow } from '@/schemas/raw-csv-row.schema';

export class PromptBuilderService {
  public buildExtractionPrompt(headers: string[], rows: RawCsvRow[]): string {
    return `You are a CRM data extraction engine for GrowEasy. Your job is to map arbitrary CSV rows (which may come from Facebook Lead Ads, Google Ads exports, Excel sheets, real estate CRMs, sales reports, marketing agency CSVs, or manually made spreadsheets) into a fixed CRM schema.

CSV HEADERS (in this exact order): ${JSON.stringify(headers)}

CSV ROWS (JSON array, each object keyed by the headers above):
${JSON.stringify(rows, null, 2)}

TARGET CRM FIELDS AND RULES:
1. created_at: Lead creation date. Must be a string parseable by JavaScript's "new Date(created_at)". If no date column exists, use an empty string.
2. name: Lead's full name. Combine first/last name columns if split across two columns.
3. email: Primary email address. If multiple emails exist in one cell or column, use the FIRST one here and append the rest into crm_note as "Additional email: ...".
4. country_code: Phone country code (e.g. "+91"). Infer from mobile number format if not explicit; leave blank if unknown.
5. mobile_without_country_code: Phone number WITHOUT the country code. If multiple numbers exist, use the FIRST here and append remaining numbers into crm_note as "Additional phone: ...".
6. company: Company/organization name if present.
7. city, state, country: Location fields, map from any address-related columns.
8. lead_owner: Person/agent responsible for the lead, if present in the CSV.
9. crm_status: The ONLY valid values are exactly: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE". Use your judgment to map status/remarks columns to the closest matching value based on meaning, not just exact keyword matches. For example: "interested", "will call back", "follow up needed", "reschedule" → GOOD_LEAD_FOLLOW_UP. "not reachable", "no answer", "busy" → DID_NOT_CONNECT. "not interested", "rejected", "spam" → BAD_LEAD. "deal closed", "converted", "won" → SALE_DONE. Only output an empty string "" if the row gives you NO reasonable signal about lead status at all. NEVER output any value outside this exact list of four, and NEVER output "UNKNOWN", "N/A", or "None".
10. crm_note: Use this field for remarks, follow-up notes, additional comments, extra phone numbers, extra emails, or any useful information from the row that doesn't fit any other field.
11. data_source: This field is EXTREMELY STRICT. The ONLY valid values are: "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots". If you are not highly confident which one matches, you MUST output an empty string "". NEVER output "UNKNOWN", "N/A", "None", or any value not in this exact list of five.
12. possession_time: Property possession timeframe, only relevant for real estate leads, else blank.
13. description: Any additional descriptive text about the lead that doesn't belong elsewhere.

CRITICAL RULES:
- If a row has NEITHER an email NOR a mobile number anywhere in its data, set "_skip": true and "_skip_reason" to a short explanation (e.g. "No email or mobile number found"). Still include the row in the output array with whatever fields you could extract, but mark _skip as true.
- If a row has at least an email OR a mobile number, set "_skip": false.
- Escape any newlines within field values as "\\n" so the data remains safe for single-row CSV export.
- Do not fabricate data that isn't present or reasonably inferable from the row.
- Return exactly one JSON object per input row, in the same order as the input rows.
- Respond with ONLY the JSON object matching the required schema — no markdown, no explanation text.`;
  }
}

export const promptBuilderService = new PromptBuilderService();