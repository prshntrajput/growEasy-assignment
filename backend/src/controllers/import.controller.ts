import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/utils/AppError';
import { csvParserService } from '@/services/csv-parser.service';
import { batchService } from '@/services/batch.service';
import { jobStoreService } from '@/services/job-store.service';
import { inngest } from '@/inngest/client';
import { ImportRequestSchema } from '@/schemas/batch-request.schema';

export class ImportController {
  public static async parseCsvFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw AppError.badRequest(
          'No file uploaded. Field name must be "file".'
        );
      }

      const parsedCsv = csvParserService.parseBuffer(req.file.buffer);

      sendSuccess(res, parsedCsv, 200, 'CSV parsed successfully');
    } catch (err) {
      next(err);
    }
  }

  public static async confirmImport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsedBody = ImportRequestSchema.parse(req.body);
      const { headers, rows } = parsedBody;

      const normalizedRows = csvParserService.normalizeRows(rows);

      if (normalizedRows.length === 0) {
        throw AppError.badRequest('No valid rows found after normalization');
      }

      const { jobId, batches } = batchService.createBatches(
        headers,
        normalizedRows
      );

      jobStoreService.create(jobId, batches.length);

      await inngest.send({
        name: 'import/csv.requested',
        data: {
          jobId,
          totalBatches: batches.length,
          batches,
        },
      });

      sendSuccess(
        res,
        {
          jobId,
          totalBatches: batches.length,
          totalRows: normalizedRows.length,
        },
        202,
        'Import job accepted and processing has started'
      );
    } catch (err) {
      next(err);
    }
  }

  public static async getJobStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        throw AppError.badRequest('jobId parameter is required');
      }

      const job = jobStoreService.get(jobId);

      if (!job) {
        throw AppError.notFound(`No job found with id ${jobId}`);
      }

      sendSuccess(res, job, 200, 'Job status retrieved');
    } catch (err) {
      next(err);
    }
  }
}