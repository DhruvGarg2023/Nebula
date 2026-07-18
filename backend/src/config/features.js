/**
 * Feature flags for conditional feature availability.
 * Allows modules to be disabled without code changes —
 * useful during staged rollouts or partial deployments.
 */
const features = Object.freeze({
  AI_ENABLED: !!process.env.OPENAI_API_KEY,
  GITHUB_ENABLED: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
  COMPILER_ENABLED: !!process.env.COMPILER_API_URL,
  SENTRY_ENABLED: !!process.env.SENTRY_DSN,
});

export default features;
