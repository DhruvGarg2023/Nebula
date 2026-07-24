import config from '../../config/index.js';
import { GroqProvider } from './providers/groq.js';
import { MockAiProvider } from './providers/mock.js';
import logger from '../../core/logger/index.js';

let activeProvider = null;

export function getAiProvider() {
  if (activeProvider) return activeProvider;

  const groqKey = process.env.GROQ_API_KEY || config.GROQ_API_KEY;

  if (groqKey) {
    logger.info(`Initializing Groq AI Provider (Model: ${config.GROQ_MODEL || 'llama-3.3-70b-versatile'})`);
    activeProvider = new GroqProvider(groqKey);
  } else {
    logger.info('No GROQ_API_KEY found — using Mock AI Provider for zero-cost testing');
    activeProvider = new MockAiProvider();
  }

  return activeProvider;
}

export function setAiProvider(provider) {
  activeProvider = provider;
}
