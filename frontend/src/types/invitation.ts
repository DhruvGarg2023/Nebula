// ═══════════════════════════════════════════════════════════════
// Invitation Types
// ═══════════════════════════════════════════════════════════════

import type { Role } from "./room";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invitation {
  id: string;
  roomId: string;
  invitedBy: string;
  token: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  inviter?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CreateInvitationData {
  role?: "viewer" | "editor";
  expiresInHours?: number;
}

export interface AcceptInvitationData {
  token: string;
}

export interface InvitationDetails {
  room: {
    id: string;
    name: string;
  };
  role: Role;
  expiresAt: string;
}
