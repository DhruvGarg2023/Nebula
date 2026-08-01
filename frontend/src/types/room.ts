// ═══════════════════════════════════════════════════════════════
// Room Types
// ═══════════════════════════════════════════════════════════════

export type Role = "viewer" | "editor" | "admin";

export interface Room {
  id: string;
  name: string;
  description: string | null;
  language: string;
  ownerId: string;
  isPublic: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  membership?: RoomMembership | null;
  _count?: {
    members?: number;
    files?: number;
  };
}

export interface RoomMembership {
  id: string;
  roomId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CreateRoomData {
  name: string;
  description?: string;
  language?: string;
  isPublic?: boolean;
  settings?: Record<string, unknown>;
}

export interface UpdateRoomData {
  name?: string;
  description?: string | null;
  language?: string;
  isPublic?: boolean;
  settings?: Record<string, unknown>;
}

export interface UpdateMemberRoleData {
  role: Role;
}

export interface RoomListFilters {
  page?: number;
  limit?: number;
}
