/**
 * Prompt Template Builder for LLM Code Analysis.
 */

export function buildReviewPrompt(sourceCode, language = 'javascript') {
  const systemPrompt = `You are a senior software architect and code reviewer. Analyze the following ${language} code for bugs, security vulnerabilities, performance issues, and readability improvements.
Output your evaluation as a valid JSON object strictly matching this schema:
{
  "summary": "High-level overview of the code quality and major findings",
  "issues": [
    {
      "line": 1,
      "severity": "info" | "warning" | "critical",
      "category": "security" | "bug" | "performance" | "style",
      "message": "Clear explanation of the problem",
      "suggestion": "Specific code fix or improvement"
    }
  ],
  "suggestions": [
    "General architectural recommendation 1",
    "General architectural recommendation 2"
  ]
}`;

  const userPrompt = `Language: ${language}\n\nCode to review:\n\`\`\`${language}\n${sourceCode}\n\`\`\``;

  return { systemPrompt, userPrompt };
}

export function buildExplainPrompt(sourceCode, language = 'javascript') {
  const systemPrompt = `You are an expert programming instructor. Explain the provided ${language} code clearly, breaking down key components, logical flow, data transformations, and algorithm complexity.`;
  const userPrompt = `Please explain this ${language} code:\n\`\`\`${language}\n${sourceCode}\n\`\`\``;

  return { systemPrompt, userPrompt };
}

export function buildSuggestPrompt(sourceCode, instruction = '', language = 'javascript') {
  const systemPrompt = `You are a principal software engineer. Provide refactored, clean, and optimized code recommendations based on best practices.`;
  const userPrompt = `Language: ${language}\nInstructions: ${instruction || 'Refactor for performance, readability, and modern best practices.'}\n\nOriginal Code:\n\`\`\`${language}\n${sourceCode}\n\`\`\``;

  return { systemPrompt, userPrompt };
}
