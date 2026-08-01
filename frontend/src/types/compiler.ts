// ═══════════════════════════════════════════════════════════════
// Compiler / Execution Types
// ═══════════════════════════════════════════════════════════════

export type JobStatus = "queued" | "running" | "completed" | "failed" | "timeout";

export interface CompilerJob {
  id: string;
  roomId: string;
  userId: string;
  fileId: string | null;
  language: string;
  sourceCode: string;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  status: JobStatus;
  executionTimeMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ExecuteCodeData {
  language: string;
  sourceCode: string;
  fileId?: string;
}

export interface CompilerStreamEvent {
  jobId: string;
  roomId: string;
  chunk: string;
}

export interface CompilerDoneEvent {
  id: string;
  status: JobStatus;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  executionTimeMs: number | null;
}
