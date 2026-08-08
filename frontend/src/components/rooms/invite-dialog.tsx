"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Share2,
  Link2,
  Trash2,
  Loader2,
  Clock,
  Users,
  Check,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "./role-selector";
import { roomsApi } from "@/services/api/rooms";
import { QUERY_KEYS } from "@/lib/constants";
import type { Invitation, CreateInvitationData } from "@/types";

interface InviteDialogProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * InviteDialog — Linear/Vercel styled invitation link generator and manager.
 */
export function InviteDialog({
  roomId,
  isOpen,
  onClose,
}: InviteDialogProps) {
  const queryClient = useQueryClient();
  const [role, setRole] = React.useState<"viewer" | "editor">(
    "editor"
  );
  const [expiresInHours, setExpiresInHours] = React.useState<number>(168); // default 7 days
  const [generatedInvite, setGeneratedInvite] = React.useState<Invitation | null>(
    null
  );
  const [copied, setCopied] = React.useState(false);

  // ── 1. Fetch active invitations ──────────────────────────────
  const {
    data: invitesResponse,
    isLoading: invitesLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.rooms.invitations(roomId),
    queryFn: () => roomsApi.listInvitations(roomId),
    enabled: isOpen,
    staleTime: 10 * 1000,
  });

  const invitations: Invitation[] = React.useMemo(() => {
    if (!invitesResponse) return [];
    const raw = (invitesResponse as any).data ?? invitesResponse;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.invitations)) return raw.data.invitations;
    if (Array.isArray(raw.invitations)) return raw.invitations;
    return [];
  }, [invitesResponse]);

  // ── 2. Create invitation mutation ────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => {
      const payload: CreateInvitationData = {
        role,
        expiresInHours,
      };
      return roomsApi.createInvitation(roomId, payload);
    },
    onSuccess: (res) => {
      const raw = (res as any).data ?? res;
      const inv: Invitation = raw.data || raw;
      setGeneratedInvite(inv);
      toast.success("Invitation link generated!");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rooms.invitations(roomId),
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create invite";
      toast.error(msg);
    },
  });

  // ── 3. Revoke invitation mutation ────────────────────────────
  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) =>
      roomsApi.revokeInvitation(roomId, invitationId),
    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rooms.invitations(roomId),
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to revoke invite";
      toast.error(msg);
    },
  });

  const inviteUrl = React.useMemo(() => {
    if (!generatedInvite?.token) return "";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/rooms/invites/${generatedInvite.token}`;
  }, [generatedInvite]);

  const handleCopy = () => {
    if (!inviteUrl) return;
    void navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <Share2 className="size-4" />
            </div>
            <div>
              <DialogTitle>Share Room & Invitations</DialogTitle>
              <DialogDescription>
                Generate secure shareable links to collaborate in real time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Create link form */}
          <div className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2)/0.5)] p-3">
            <div className="text-xs font-semibold text-[hsl(var(--foreground))]">
              Generate New Invitation Link
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Role</Label>
                <RoleSelector
                  role={role}
                  onRoleChange={(newRole) =>
                    setRole(newRole as "viewer" | "editor")
                  }
                  className="w-full justify-between"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Expires in</Label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  className="h-7 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs font-medium text-[hsl(var(--foreground))] focus:outline-none"
                >
                  <option value={24}>24 hours</option>
                  <option value={168}>7 days</option>
                  <option value={720}>30 days</option>
                </select>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="w-full gap-1.5 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              <span>Create Shareable Link</span>
            </Button>

            {/* Generated link preview */}
            {inviteUrl && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="h-7 text-xs bg-transparent border-0 font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-7 shrink-0 gap-1 px-2.5"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Active Invitations List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--foreground))]">
              <span>Active Invitations ({invitations.length})</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {invitesLoading ? (
                <div className="flex items-center justify-center py-4 text-xs text-[hsl(var(--muted-foreground))]">
                  <Loader2 className="size-4 animate-spin mr-2" />
                  <span>Loading invitations...</span>
                </div>
              ) : invitations.length === 0 ? (
                <div className="py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  No active invitations found.
                </div>
              ) : (
                invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 text-xs"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {inv.role}
                        </Badge>
                        <span className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
                          ...{inv.token.slice(-8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>
                            Expires{" "}
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => revokeMutation.mutate(inv.id)}
                      disabled={revokeMutation.isPending}
                      className="size-7 text-[hsl(var(--muted-foreground))] hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
