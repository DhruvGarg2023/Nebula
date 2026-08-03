"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  KeyRound,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Code2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { roomsApi } from "@/services/api/rooms";
import { useAuth } from "@/providers/auth-provider";
import { ROUTES } from "@/lib/constants";
import type { Room } from "@/types";

/**
 * Public Invitation Landing Page (/rooms/invites/[token])
 * Matches Section 5.7 in frontend_architecture_plan.md:
 * - Fetches invitation details via GET /rooms/invites/:token
 * - Renders Linear/Vercel styled invitation card with room preview
 * - Handles accept flow via POST /rooms/invites/accept and redirects to workspace
 */
export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const token = Array.isArray(params?.token)
    ? params.token[0]
    : (params?.token as string) || "";

  const [accepting, setAccepting] = React.useState(false);

  const {
    data: inviteResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rooms", "invite", token],
    queryFn: () => roomsApi.getInvitationDetails(token),
    enabled: Boolean(token),
    retry: 1,
  });

  const inviteDetails = inviteResponse?.data?.data;
  const room = inviteDetails?.room;
  const inviter = inviteDetails?.inviter;

  const handleAccept = async () => {
    if (!token) return;

    // If unauthenticated, redirect to login with returnUrl
    if (!isAuthenticated) {
      toast.info("Please sign in to join this workspace");
      router.push(
        `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(
          `/rooms/invites/${token}`
        )}`
      );
      return;
    }

    setAccepting(true);
    try {
      const res = await roomsApi.acceptInvitation({ token });
      const joinedRoom: Room | undefined = res.data?.data?.room;
      toast.success("Joined collaborative workspace!");
      if (joinedRoom?.id) {
        router.push(ROUTES.ROOM(joinedRoom.id));
      } else if (room?.id) {
        router.push(ROUTES.ROOM(room.id));
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to accept invitation token"
      );
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center bg-[hsl(var(--background))] px-4 py-12 select-none">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[radial-gradient(circle,hsl(var(--accent-9)/0.15)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12)_0%,transparent_70%)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-2xl"
      >
        {isLoading ? (
          <div className="space-y-6 text-center">
            <Skeleton className="mx-auto size-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="mx-auto h-6 w-48" />
              <Skeleton className="mx-auto h-4 w-64" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ) : isError || !inviteDetails ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[hsl(var(--destructive))/0.1] text-[hsl(var(--destructive))] shadow-xs">
              <AlertCircle className="size-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
                Invitation Expired or Invalid
              </h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {error instanceof Error
                  ? error.message
                  : "This invite link is no longer active or the workspace was deleted."}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full text-xs font-semibold"
            >
              <a href={ROUTES.DASHBOARD}>Return to Dashboard</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            {/* Header Icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] shadow-xs">
              <Code2 className="size-7" />
            </div>

            {/* Title & Inviter Info */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                You've Been Invited to Collaborate
              </h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {inviter?.name ? (
                  <>
                    <strong className="text-[hsl(var(--foreground))]">
                      {inviter.name}
                    </strong>{" "}
                    invited you to join a workspace on CodeSync.
                  </>
                ) : (
                  "You have been invited to join a collaborative IDE workspace."
                )}
              </p>
            </div>

            {/* Room Preview Box */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.4] p-5 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                  {room?.name || "CodeSync Workspace"}
                </span>
                {room?.language && (
                  <Badge
                    variant="info"
                    className="font-mono text-[10px] uppercase"
                  >
                    {room.language}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                {room?.description ||
                  "A real-time collaborative coding workspace."}
              </p>
              <div className="flex items-center justify-between border-t border-[hsl(var(--border))/0.6] pt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-1">
                  <Users className="size-3 text-[hsl(var(--accent-9))]" />
                  <span>
                    {room?.membersCount ?? 1}{" "}
                    {room?.membersCount === 1 ? "member" : "members"}
                  </span>
                </div>
                {inviteDetails.role && (
                  <span className="font-semibold text-[hsl(var(--primary))] uppercase">
                    Role: {inviteDetails.role}
                  </span>
                )}
              </div>
            </div>

            {/* Accept Button */}
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full h-11 text-sm font-semibold shadow-md gap-2"
              >
                <Sparkles className="size-4" />
                <span>
                  {accepting
                    ? "Joining Workspace..."
                    : isAuthenticated
                    ? "Accept & Join Workspace"
                    : "Sign In to Join Workspace"}
                </span>
                <ArrowRight className="size-4" />
              </Button>

              {!isAuthenticated && (
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  You will be asked to sign in with Google or Developer account first.
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
