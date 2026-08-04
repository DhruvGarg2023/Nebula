"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SocketProvider, useSocket } from "@/providers/socket-provider";
import { useAuth } from "@/providers/auth-provider";
import { RoomTopbar } from "@/components/editor/room-topbar";
import { type PresenceMember } from "@/components/common/presence-avatars";
import { InviteDialog, MemberList } from "@/components/rooms";
import { roomsApi } from "@/services/api/rooms";
import { QUERY_KEYS, SOCKET_EVENTS, ROUTES } from "@/lib/constants";
import type { Room, RoomMember, Role } from "@/types";

// ═══════════════════════════════════════════════════════════════
// Room Context
// ═══════════════════════════════════════════════════════════════

export interface RoomContextValue {
  room: Room | undefined;
  members: RoomMember[];
  onlineMembers: PresenceMember[];
  role: Role | null;
  canEdit: boolean;
  canManage: boolean;
  isLoading: boolean;
  error: unknown;
}

const RoomContext = React.createContext<RoomContextValue | undefined>(undefined);

export function useRoom() {
  const ctx = React.useContext(RoomContext);
  if (!ctx) {
    throw new Error("useRoom must be used within a RoomWorkspaceLayout");
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════
// Inner Layout Component
// ═══════════════════════════════════════════════════════════════

function RoomWorkspaceInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { user } = useAuth();
  const { connect } = useSocket();

  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [isMembersOpen, setIsMembersOpen] = React.useState(false);

  // Fetch Room details
  const {
    data: roomResponse,
    isLoading: isRoomLoading,
    error: roomError,
  } = useQuery({
    queryKey: QUERY_KEYS.rooms.detail(roomId),
    queryFn: () => roomsApi.get(roomId),
    enabled: !!roomId,
    retry: 1,
  });

  // Fetch Room members
  const {
    data: membersResponse,
    isLoading: isMembersLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.rooms.members(roomId),
    queryFn: () => roomsApi.listMembers(roomId),
    enabled: !!roomId,
  });

  const room: Room | undefined = roomResponse?.data?.data;
  const members: RoomMember[] = React.useMemo(
    () => membersResponse?.data?.data || [],
    [membersResponse]
  );

  // Derive Current User Role in Room
  const currentMember = React.useMemo(
    () => members.find((m) => m.userId === user?.id),
    [members, user?.id]
  );
  const role: Role | null = currentMember?.role || null;
  const roleString = String(role || "").toLowerCase();
  const canEdit =
    roleString === "owner" || roleString === "admin" || roleString === "editor";
  const canManage = roleString === "owner" || roleString === "admin";

  // Presence Tracking State
  const [onlineMembers, setOnlineMembers] = React.useState<PresenceMember[]>(
    []
  );

  // Connect to Collaboration Namespace for Real-time Presence
  React.useEffect(() => {
    if (!roomId) return;
    const socket = connect("/collaboration");
    if (!socket) return;

    socket.emit("room:join", { roomId }, (response?: any) => {
      if (response && !response.success) {
        toast.error("Failed to join real-time room channel");
      }
    });

    const handleRoomUsers = (usersList: any[]) => {
      if (Array.isArray(usersList)) {
        setOnlineMembers(
          usersList.map((u) => ({
            id: u.userId || u.id,
            name: u.name || "Collaborator",
            avatarUrl: u.avatarUrl,
            isOnline: true,
          }))
        );
      }
    };

    const handleUserJoined = (newUser: any) => {
      setOnlineMembers((prev) => {
        if (prev.some((m) => m.id === (newUser.userId || newUser.id)))
          return prev;
        return [
          ...prev,
          {
            id: newUser.userId || newUser.id,
            name: newUser.name || "Collaborator",
            avatarUrl: newUser.avatarUrl,
            isOnline: true,
          },
        ];
      });
      toast.info(`${newUser.name || "A collaborator"} joined the room`);
    };

    const handleUserLeft = (leftUser: { userId?: string; id?: string }) => {
      const leftId = leftUser.userId || leftUser.id;
      setOnlineMembers((prev) => prev.filter((m) => m.id !== leftId));
    };

    socket.on("room:users", handleRoomUsers);
    socket.on("room:user_joined", handleUserJoined);
    socket.on("room:user_left", handleUserLeft);
    socket.on("room:user_offline", handleUserLeft);

    return () => {
      socket.off("room:users", handleRoomUsers);
      socket.off("room:user_joined", handleUserJoined);
      socket.off("room:user_left", handleUserLeft);
      socket.off("room:user_offline", handleUserLeft);
      socket.emit("room:leave", { roomId });
    };
  }, [roomId, connect]);

  const isLoading = isRoomLoading || isMembersLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
        <Loader2 className="size-8 animate-spin text-[hsl(var(--primary))] mb-4" />
        <span className="text-sm font-medium">
          Loading collaborative workspace...
        </span>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[hsl(var(--background))] p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-4">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">
          Room Not Found or Access Denied
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-6">
          This room may have been deleted, or you do not have permission to view
          it.
        </p>
        <Button
          onClick={() => router.push(ROUTES.ROOMS)}
          className="gap-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Rooms</span>
        </Button>
      </div>
    );
  }

  return (
    <RoomContext.Provider
      value={{
        room,
        members,
        onlineMembers,
        role,
        canEdit,
        canManage,
        isLoading,
        error: roomError,
      }}
    >
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[hsl(var(--background))] select-none">
        <RoomTopbar
          room={room}
          onlineMembers={onlineMembers}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenMembers={() => setIsMembersOpen(true)}
          canManage={canManage}
        />
        <main className="flex-1 w-full overflow-hidden">{children}</main>

        <InviteDialog
          roomId={roomId}
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />

        <MemberList
          roomId={roomId}
          currentUserId={user?.id}
          isOpen={isMembersOpen}
          onClose={() => setIsMembersOpen(false)}
        />
      </div>
    </RoomContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// Root Exported Layout Component
// ═══════════════════════════════════════════════════════════════

export default function RoomWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SocketProvider>
        <RoomWorkspaceInner>{children}</RoomWorkspaceInner>
      </SocketProvider>
    </ProtectedRoute>
  );
}
