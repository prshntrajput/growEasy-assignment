import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '@/config/env';

if (!env.GEMINI_API_KEY) {
  console.warn(
    'GEMINI_API_KEY is not set. AI extraction will fail until configured.'
  );
}

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const CRM_RECORD_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT as SchemaType.OBJECT,
  properties: {
    records: {
      type: SchemaType.ARRAY as SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT as SchemaType.OBJECT,
        properties: {
          created_at: { type: SchemaType.STRING as SchemaType.STRING },
          name: { type: SchemaType.STRING as SchemaType.STRING },
          email: { type: SchemaType.STRING as SchemaType.STRING },
          country_code: { type: SchemaType.STRING as SchemaType.STRING },
          mobile_without_country_code: {
            type: SchemaType.STRING as SchemaType.STRING,
          },
          company: { type: SchemaType.STRING as SchemaType.STRING },
          city: { type: SchemaType.STRING as SchemaType.STRING },
          state: { type: SchemaType.STRING as SchemaType.STRING },
          country: { type: SchemaType.STRING as SchemaType.STRING },
          lead_owner: { type: SchemaType.STRING as SchemaType.STRING },
          crm_status: { type: SchemaType.STRING as SchemaType.STRING },
          crm_note: { type: SchemaType.STRING as SchemaType.STRING },
          data_source: { type: SchemaType.STRING as SchemaType.STRING },
          possession_time: { type: SchemaType.STRING as SchemaType.STRING },
          description: { type: SchemaType.STRING as SchemaType.STRING },
          _skip: { type: SchemaType.BOOLEAN as SchemaType.BOOLEAN },
          _skip_reason: { type: SchemaType.STRING as SchemaType.STRING },
        },
        required: ['created_at', 'name', '_skip'],
      },
    },
  },
  required: ['records'],
} as const;

export const getGeminiModel = (modelName = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: CRM_RECORD_RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });
};