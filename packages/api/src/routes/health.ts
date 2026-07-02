import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '@decisionhub/shared';

const router = Router();

router.get('/', (req: Request, res: Response<HealthCheckResponse>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

export default router;
