import { Response } from 'express';

interface SuccessPayload<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorPayload {
  success: false;
  message: string;
  details?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response<SuccessPayload<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
): Response<ErrorPayload> => {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};