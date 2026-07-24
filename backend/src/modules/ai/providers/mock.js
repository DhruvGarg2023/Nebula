import logger from '../../../core/logger/index.js';

export class MockAiProvider {
  name = 'mock';

  async generateReview(sourceCode, language = 'javascript') {
    logger.info({ provider: 'mock', language }, 'Generating Mock AI Code Review');

    const mockResponse = {
      summary: `Automated AI code analysis for ${language} codebase. Code structure appears sound with minor recommendations.`,
      issues: [
        {
          line: 1,
          severity: 'warning',
          category: 'performance',
          message: 'Consider using const or let instead of global bindings.',
          suggestion: 'Use modern ES6 block scoping for variables.',
        },
        {
          line: sourceCode.split('\n').length > 5 ? 5 : 1,
          severity: 'info',
          category: 'style',
          message: 'Ensure explicit error handling is wrapped around network / I/O operations.',
          suggestion: 'Add try-catch or async error boundaries.',
        },
      ],
      suggestions: [
        'Add comprehensive unit tests for core logical branches.',
        'Use TypeScript interfaces or JSDoc typedefs for improved type safety.',
      ],
    };

    return JSON.stringify(mockResponse);
  }

  async generateExplanation(sourceCode, language = 'javascript') {
    logger.info({ provider: 'mock', language }, 'Generating Mock AI Code Explanation');
    return `### Code Explanation (${language})\nThis code defines a modular function in ${language}. It processes inputs sequentially and returns an evaluated result. Standard error bounds apply.`;
  }

  async generateSuggestion(sourceCode, instruction = '', language = 'javascript') {
    logger.info({ provider: 'mock', language }, 'Generating Mock AI Code Refactoring');
    return `// Refactored ${language} Code (${instruction || 'Optimized'})\n${sourceCode}\n// Refactored for clean code and performance`;
  }
}
