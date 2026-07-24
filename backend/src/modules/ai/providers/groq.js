import logger from '../../../core/logger/index.js';
import { AppError } from '../../../core/errors/AppError.js';
import config from '../../../config/index.js';

export class GroqProvider {
  name = 'groq';

  constructor(apiKey, model = config.GROQ_MODEL || 'llama-3.3-70b-versatile') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async callGroqApi(messages, responseFormat = null) {
    const payload = {
      model: this.model,
      messages,
      temperature: 0.2,
    };

    if (responseFormat) {
      payload.response_format = responseFormat;
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new AppError('AI_PROVIDER_ERROR', `Groq API error: ${errBody.error?.message || res.statusText}`, res.status);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || '';
  }

  async generateReview(sourceCode, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are a senior code reviewer. Analyze the following ${language} code for bugs, security risks, performance issues, and code smells. Output strictly valid JSON matching: {"summary":"string", "issues":[{"line":number,"severity":"info"|"warning"|"critical","category":"string","message":"string","suggestion":"string"}],"suggestions":["string"]}`,
      },
      {
        role: 'user',
        content: `Review code (${language}):\n${sourceCode}`,
      },
    ];

    return this.callGroqApi(messages, { type: 'json_object' });
  }

  async generateExplanation(sourceCode, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `Explain the provided ${language} code clearly, breaking down logical flow, algorithms, and complexity.`,
      },
      {
        role: 'user',
        content: `Explain this ${language} code:\n${sourceCode}`,
      },
    ];

    return this.callGroqApi(messages);
  }

  async generateSuggestion(sourceCode, instruction = '', language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `Refactor the provided ${language} code based on best practices.`,
      },
      {
        role: 'user',
        content: `Instructions: ${instruction || 'Optimize for readability and performance'}\nCode:\n${sourceCode}`,
      },
    ];

    return this.callGroqApi(messages);
  }
}
