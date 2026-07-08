import { Router } from 'express';
import { ImportController } from '@/controllers/import.controller';
import { csvUploadMiddleware } from '@/middlewares/upload.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { ImportRequestSchema } from '@/schemas/batch-request.schema';

const router = Router();

router.post('/csv/parse', csvUploadMiddleware, ImportController.parseCsvFile);

router.post('/import', validate(ImportRequestSchema), ImportController.confirmImport);

router.get('/import/:jobId/status', ImportController.getJobStatus);
export default router;
