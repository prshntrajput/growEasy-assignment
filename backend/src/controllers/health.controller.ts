import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { getGeminiModel } from '@/config/gemini.client';

export class HealthController {
  static ping(_req: Request, res: Response): void {
    sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() }, 200, 'Server is healthy');
  }

  static async testGemini(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const model = getGeminiModel();
      const result = await model.generateContent('Reply with exactly the word: pong');
      const text = result.response.text();

      sendSuccess(res, { geminiResponse: text }, 200, 'Gemini API is reachable');
    } catch (err) {
      next(err);
    }
  }
}