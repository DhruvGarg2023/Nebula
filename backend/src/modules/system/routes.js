import { Router } from 'express';
import { healthCheck, readinessCheck } from './controllers.js';
import asyncHandler from '../../core/utils/asyncHandler.js';

/**
 * System routes — health and readiness probes.
 * These routes are NOT behind authentication (load balancers need access).
 */
const router = Router();

// Liveness probe — is the process alive?
router.get('/health', healthCheck);

// Readiness probe — are dependencies healthy?
router.get('/ready', asyncHandler(readinessCheck));

export default router;
