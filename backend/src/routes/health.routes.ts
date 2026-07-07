import { Router } from 'express';
import { HealthController } from '@/controllers/health.controller';

const router = Router();

router.get('/ping', HealthController.ping);
router.get('/gemini-test', HealthController.testGemini);

export default router;