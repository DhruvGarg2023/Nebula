"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Trash2, Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleSelector } from "@/components/rooms/role-selector";
import { roomsApi } from "@/services/api/rooms";
import { QUERY_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RoomMember, Role } from "@/types";

interface MemberListProps {
  roomId: string;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MemberList — dialog inspecting all room members, role assignment, and removals.
 */
export function MemberList({
  roomId,
  currentUserId,
  isOpen,
  onClose,
}: MemberListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    data: membersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.rooms.members(roomId),
    queryFn: () => roomsApi.listMembers(roomId),
    enabled: isOpen,
    staleTime: 10 * 1000,
  });

  const members: RoomMember[] = React.useMemo(() => {
    if (!membersResponse) return [];
    const raw = (membersResponse as any).data ?? membersResponse;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.members)) return raw.data.members;
    if (Array.isArray(raw.members)) return raw.members;
    return [];
  }, [membersResponse]);

  const currentMember = React.useMemo(() => {
    return members.find((m) => m.userId === currentUserId);
  }, [members, currentUserId]);

  const isAdmin =
    String(currentMember?.role).toLowerCase() === "admin" ||
    String(currentMember?.role).toLowerCase() === "owner";

  // ── Role update mutation ─────────────────────────────────────
  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "viewer" | "editor" | "admin";
    }) => roomsApi.updateMemberRole(roomId, userId, { role: role as Role }),
    onSuccess: () => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rooms.members(roomId),
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update member role";
      toast.error(msg);
    },
  });

  // ── Remove member mutation ───────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (userId: string) => roomsApi.removeMember(roomId, userId),
    onSuccess: () => {
      toast.success("Member removed from room");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rooms.members(roomId),
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove member";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <Users className="size-4" />
            </div>
            <div>
              <DialogTitle>Room Members ({members.length})</DialogTitle>
              <DialogDescription>
                Collaborators currently with access to this room workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto py-2 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-[hsl(var(--muted-foreground))]">
              <Loader2 className="size-4 animate-spin mr-2 text-[hsl(var(--primary))]" />
              <span>Loading team members...</span>
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-xs text-rose-500">
              Failed to load room members.
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              No members found.
            </div>
          ) : (
            members.map((member) => {
              const user = member.user || {
                id: member.userId,
                name: "Unknown Member",
                email: "",
                avatarUrl: "",
              };
              const isSelf = member.userId === currentUserId;
              const isOwner =
                String(member.role).toLowerCase() === "owner" ||
                String(member.role).toLowerCase() === "admin";

              return (
                <div
                  key={member.id || member.userId}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-colors hover:bg-[hsl(var(--accent)/0.03)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={user.avatarUrl || ""}
                      alt={user.name}
                      name={user.name}
                      size="sm"
                      className="size-8 shrink-0 border border-[hsl(var(--border))]"
                    />

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate text-xs font-semibold text-[hsl(var(--foreground))]">
                          {user.name}
                        </span>
                        {isSelf && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1 text-[9px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]"
                          >
                            You
                          </Badge>
                        )}
                        {isOwner && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1 text-[9px] border-amber-500/30 bg-amber-500/10 text-amber-500"
                          >
                            Owner
                          </Badge>
                        )}
                      </div>
                      {user.email && (
                        <span className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role selector or Static Badge */}
                    {isAdmin && !isOwner && !isSelf ? (
                      <RoleSelector
                        role={
                          member.role.toLowerCase() as
                            | "viewer"
                            | "editor"
                            | "admin"
                        }
                        onRoleChange={(newRole) =>
                          updateRoleMutation.mutate({
                            userId: member.userId,
                            role: newRole,
                          })
                        }
                        disabled={updateRoleMutation.isPending}
                      />
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold"
                      >
                        {member.role}
                      </Badge>
                    )}

                    {/* Remove Member Button */}
                    {isAdmin && !isOwner && !isSelf && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeMutation.mutate(member.userId)}
                        disabled={removeMutation.isPending}
                        className="size-7 text-[hsl(var(--muted-foreground))] hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
