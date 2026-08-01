import apiClient from "./client";
import type {
  ApiResponse,
  Room,
  RoomMember,
  CreateRoomData,
  UpdateRoomData,
  UpdateMemberRoleData,
  RoomListFilters,
  PaginatedResponse,
} from "@/types";
import type {
  Invitation,
  CreateInvitationData,
  AcceptInvitationData,
  InvitationDetails,
} from "@/types/invitation";

/**
 * Rooms API service.
 * Maps 1:1 to backend /api/v1/rooms endpoints.
 */
export const roomsApi = {
  // ── Room CRUD ──────────────────────────────────────────────

  /** GET /rooms?page=&limit= */
  list: (filters?: RoomListFilters) =>
    apiClient.get<ApiResponse<Room[]> & { meta: PaginatedResponse<Room>["meta"] }>(
      "/rooms",
      { params: filters }
    ),

  /** POST /rooms */
  create: (data: CreateRoomData) =>
    apiClient.post<ApiResponse<Room>>("/rooms", data),

  /** GET /rooms/:roomId */
  get: (roomId: string) =>
    apiClient.get<ApiResponse<Room>>(`/rooms/${roomId}`),

  /** PATCH /rooms/:roomId */
  update: (roomId: string, data: UpdateRoomData) =>
    apiClient.patch<ApiResponse<Room>>(`/rooms/${roomId}`, data),

  /** DELETE /rooms/:roomId */
  delete: (roomId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/rooms/${roomId}`),

  // ── Members ────────────────────────────────────────────────

  /** GET /rooms/:roomId/members */
  listMembers: (roomId: string) =>
    apiClient.get<ApiResponse<RoomMember[]>>(`/rooms/${roomId}/members`),

  /** PATCH /rooms/:roomId/members/:userId/role */
  updateMemberRole: (roomId: string, userId: string, data: UpdateMemberRoleData) =>
    apiClient.patch<ApiResponse<RoomMember>>(
      `/rooms/${roomId}/members/${userId}/role`,
      data
    ),

  /** DELETE /rooms/:roomId/members/:userId */
  removeMember: (roomId: string, userId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/rooms/${roomId}/members/${userId}`
    ),

  /** POST /rooms/:roomId/leave */
  leave: (roomId: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(`/rooms/${roomId}/leave`),

  // ── Invitations ────────────────────────────────────────────

  /** GET /rooms/invites/:token (public, no auth) */
  getInvitationDetails: (token: string) =>
    apiClient.get<ApiResponse<InvitationDetails>>(`/rooms/invites/${token}`),

  /** POST /rooms/invites/accept */
  acceptInvitation: (data: AcceptInvitationData) =>
    apiClient.post<ApiResponse<{ message: string; room: Room }>>(
      "/rooms/invites/accept",
      data
    ),

  /** GET /rooms/:roomId/invites */
  listInvitations: (roomId: string) =>
    apiClient.get<ApiResponse<Invitation[]>>(`/rooms/${roomId}/invites`),

  /** POST /rooms/:roomId/invites */
  createInvitation: (roomId: string, data: CreateInvitationData) =>
    apiClient.post<ApiResponse<Invitation>>(`/rooms/${roomId}/invites`, data),

  /** DELETE /rooms/:roomId/invites/:invitationId */
  revokeInvitation: (roomId: string, invitationId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/rooms/${roomId}/invites/${invitationId}`
    ),
};
