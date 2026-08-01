// ═══════════════════════════════════════════════════════════════
// File Types
// ═══════════════════════════════════════════════════════════════

export interface CodeFile {
  id: string;
  roomId: string;
  name: string;
  language: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileData {
  name: string;
  language: string;
  content?: string;
}

export interface UpdateFileData {
  name?: string;
  language?: string;
  content?: string;
}
