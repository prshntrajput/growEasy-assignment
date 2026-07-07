import { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/AppError';
import { sendError } from '@/utils/response';

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    console.error(
      `[AppError] ${req.method} ${req.originalUrl} -> ${err.statusCode}: ${err.message}`
    );
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  console.error(`[UnhandledError] ${req.method} ${req.originalUrl}:`, err);
  sendError(res, 'Something went wrong. Please try again later.', 500);
};
