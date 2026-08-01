// ═══════════════════════════════════════════════════════════════
// Version History Types
// ═══════════════════════════════════════════════════════════════

export interface Version {
  id: string;
  roomId: string;
  createdBy: string;
  label: string | null;
  description: string | null;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  versionFiles?: VersionFile[];
}

export interface VersionFile {
  id: string;
  versionId: string;
  fileName: string;
  filePath: string;
  content: string;
  language: string | null;
}

export interface CreateVersionData {
  label?: string;
  description?: string;
}

export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  line: string;
  baseLine?: number;
  targetLine?: number;
  lineNumber?: number;
}

export type DiffFileStatus = "added" | "deleted" | "modified" | "unchanged";

export interface FileDiff {
  fileName: string;
  status: DiffFileStatus;
  baseContent: string | null;
  targetContent: string | null;
  lines: DiffLine[];
}

export interface VersionDiff {
  baseVersion: {
    id: string;
    label: string | null;
    createdAt: string;
  };
  targetVersion: {
    id: string | null;
    label: string;
  };
  summary: {
    totalFiles: number;
    filesAdded: number;
    filesDeleted: number;
    filesModified: number;
    filesUnchanged: number;
  };
  files: FileDiff[];
}

export interface RestoreResult {
  version: {
    id: string;
    label: string | null;
    createdAt: string;
  };
  restoredFiles: Array<{
    id: string;
    name: string;
    language: string;
  }>;
}
