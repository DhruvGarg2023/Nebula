import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthCheck, readinessCheck } from './controllers.js';
import { openApiSpec } from './docs.js';
import { getQueueStatus } from './bullBoard.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

/**
 * System routes — health and readiness probes, API documentation, queue monitoring.
 * These routes are NOT behind authentication (load balancers & monitoring need access).
 */
const router = Router();

// Liveness probe — is the process alive?
router.get('/health', healthCheck);

// Readiness probe — are dependencies healthy?
router.get('/ready', asyncHandler(readinessCheck));

// OpenAPI 3.0 Documentation Specification JSON
router.get('/docs/openapi.json', (req, res) => res.json(openApiSpec));

// Interactive Swagger UI (serves bundled CSS/JS locally)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// BullMQ Queue Monitoring Dashboard Status
router.get('/queues', asyncHandler(getQueueStatus));

export default router;
