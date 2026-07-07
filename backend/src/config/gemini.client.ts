import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/env';

if (!env.GEMINI_API_KEY) {
  console.warn(' GEMINI_API_KEY is not set. AI extraction will fail until configured.');
}

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getGeminiModel = (modelName = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};
