import { Router } from 'express';
import { healthCheck, readinessCheck } from './controllers.js';
import { openApiSpec, renderSwaggerUiHtml } from './docs.js';
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

// Interactive Swagger UI
router.get('/docs', (req, res) => res.setHeader('Content-Type', 'text/html').send(renderSwaggerUiHtml()));

// BullMQ Queue Monitoring Dashboard Status
router.get('/queues', asyncHandler(getQueueStatus));

export default router;
