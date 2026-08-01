// ═══════════════════════════════════════════════════════════════
// Chat / Message Types
// ═══════════════════════════════════════════════════════════════

export type MessageType = "USER" | "SYSTEM";

export interface Message {
  id: string;
  roomId: string;
  userId: string | null;
  content: string;
  type: MessageType;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export interface SendMessageData {
  roomId: string;
  content: string;
}
