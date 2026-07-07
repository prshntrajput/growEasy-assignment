import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject, ZodRawShape } from 'zod';
import { AppError } from '@/utils/AppError';

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(AppError.badRequest('Validation failed', formatted));
        return;
      }
      next(err);
    }
  };