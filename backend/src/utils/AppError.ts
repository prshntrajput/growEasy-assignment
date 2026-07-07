export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, details);
  }

  static payloadTooLarge(message = 'File exceeds maximum allowed size') {
    return new AppError(message, 413);
  }

  static unprocessableAI(message = 'AI returned an invalid or unprocessable response', details?: unknown) {
    return new AppError(message, 422, details);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500);
  }

  static aiProviderError(message = 'AI provider request failed') {
    return new AppError(message, 502);
  }
}