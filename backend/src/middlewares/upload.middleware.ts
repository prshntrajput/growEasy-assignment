import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const hasCsvExtension = file.originalname.toLowerCase().endsWith('.csv');
  const hasCsvMimetype =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel';

  if (!hasCsvExtension && !hasCsvMimetype) {
    cb(new Error('Only CSV files are allowed'));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

export const csvUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(AppError.payloadTooLarge());
      return;
    }

    if (err instanceof Error) {
      next(AppError.badRequest(err.message));
      return;
    }

    if (!req.file) {
      next(AppError.badRequest('CSV file is required'));
      return;
    }

    next();
  });
};