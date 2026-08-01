// ═══════════════════════════════════════════════════════════════
// AI Code Review Types
// ═══════════════════════════════════════════════════════════════

export type AiReviewStatus = "queued" | "processing" | "completed" | "failed";

export interface AiReview {
  id: string;
  roomId: string;
  userId: string;
  fileId: string | null;
  status: AiReviewStatus;
  summary: string | null;
  issues: AiIssue[];
  suggestions: AiSuggestion[];
  costUsd: number;
  createdAt: string;
  completedAt: string | null;
}

export interface AiIssue {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  line?: number;
  suggestion?: string;
}

export interface AiSuggestion {
  type: string;
  message: string;
  code?: string;
  line?: number;
}

export interface RequestReviewData {
  fileId?: string;
  sourceCode?: string;
  language?: string;
}

export interface ExplainCodeData {
  sourceCode: string;
  language?: string;
}

export interface SuggestImprovementsData {
  sourceCode: string;
  instruction?: string;
  language?: string;
}

export interface AiExplainResponse {
  explanation: string;
}

export interface AiSuggestResponse {
  suggestions: string;
}
