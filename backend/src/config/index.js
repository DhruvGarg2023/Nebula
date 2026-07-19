import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variable schema.
 * The application will crash immediately on boot if any required
 * variable is missing or invalid — fail-fast principle.
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_CALLBACK_URL: z.string().url('GOOGLE_CALLBACK_URL must be a valid URL'),

  // CORS
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Encryption
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),

  // External Services (optional — not required in Milestone 1)
  OPENAI_API_KEY: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  COMPILER_API_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // AI Limits
  AI_DAILY_LIMIT_PER_USER: z.coerce.number().int().positive().default(50),
  AI_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(500),
});

/**
 * Parse and validate environment variables.
 * Crashes on boot with clear error messages if validation fails.
 */
function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('\n╔══════════════════════════════════════════════╗');
    console.error('║  FATAL: Environment validation failed        ║');
    console.error('╚══════════════════════════════════════════════╝\n');
    console.error(formatted);
    console.error('\nCheck your .env file against .env.example\n');

    process.exit(1);
  }

  return Object.freeze(result.data);
}

/** @type {z.infer<typeof envSchema>} */
const config = loadConfig();

export default config;
export { envSchema, loadConfig };
