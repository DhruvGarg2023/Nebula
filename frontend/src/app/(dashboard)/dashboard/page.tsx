"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  KeyRound,
  Search,
  Code2,
  Users,
  Cpu,
  ArrowRight,
  Sparkles,
  FolderCode,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  RoomCard,
  CreateRoomDialog,
  JoinRoomDialog,
} from "@/components/dashboard";
import { useAuth } from "@/providers/auth-provider";
import { roomsApi } from "@/services/api/rooms";
import { ROUTES } from "@/lib/constants";
import type { Room } from "@/types";

/**
 * Enterprise Dashboard Hub (/(dashboard)/dashboard)
 * Matches Section 5.4 specifications in frontend_architecture_plan.md:
 * - Metric Cards for Workspaces, Collaborations, and Sandboxes
 * - Real-time rooms search and grid display with staggered Framer Motion animations
 * - Quick action modals (CreateRoomDialog, JoinRoomDialog)
 * - Skeleton loading and zero-room EmptyState
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = React.useState(false);

  // Query user's rooms (limit 12 on dashboard overview)
  const {
    data: roomsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["rooms", "list", { limit: 12 }],
    queryFn: () => roomsApi.list({ limit: 12, page: 1 }),
    staleTime: 30 * 1000,
  });

  const rooms: Room[] = roomsResponse?.data?.data || [];
  const totalRooms = roomsResponse?.data?.meta?.total || rooms.length;

  // Filter rooms by name/description locally
  const filteredRooms = React.useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        r.language.toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  return (
    <div className="space-y-8">
      {/* ── Page Header & Actions ───────────────────────────── */}
      <PageHeader
        title={user ? `Welcome back, ${user.name}` : "Workspace Dashboard"}
        description="Monitor your collaborative IDE rooms, real-time presence, and Docker execution engines."
        badge={
          <Badge variant="success" className="font-mono text-[10px]">
            ONLINE
          </Badge>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJoinRoomOpen(true)}
              className="gap-1.5 border-[hsl(var(--border))] text-xs font-semibold shadow-xs"
            >
              <KeyRound className="size-3.5 text-[hsl(var(--accent-9))]" />
              <span>Join Room</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateRoomOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>New Workspace</span>
            </Button>
          </div>
        }
      />

      {/* ── Quick Metric Cards (3 Columns) ────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Active Workspaces
            </p>
            <p className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {isLoading ? "-" : totalRooms}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Multi-language CRDT rooms
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]">
            <FolderCode className="size-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Real-time Sync
            </p>
            <p className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Yjs + CRDT
            </p>
            <p className="text-[11px] text-[hsl(var(--success))] font-medium">
              ● Sub-50ms latency
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--success))/0.1] text-[hsl(var(--success))]">
            <Users className="size-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs sm:col-span-2 lg:col-span-1"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Docker Sandboxes
            </p>
            <p className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              8 Runtimes
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              JS, TS, Python, Go, Rust, C++
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--info))/0.1] text-[hsl(var(--info))]">
            <Cpu className="size-5" />
          </div>
        </motion.div>
      </div>

      {/* ── Rooms Section Header & Search ──────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Recent Collaborative Rooms
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Click any room card to open the multi-panel collaborative editor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <Link href={ROUTES.ROOMS}>
              <span>View All ({totalRooms})</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Rooms Grid / Loading / Empty States ────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <div className="pt-3 flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-[hsl(var(--destructive))/0.4] bg-[hsl(var(--destructive))/0.08] p-6 text-center">
          <p className="text-sm font-semibold text-[hsl(var(--destructive))]">
            Failed to load collaborative workspaces
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3 text-xs"
          >
            Retry Request
          </Button>
        </div>
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? "No workspaces match your search"
              : "No collaborative rooms yet"
          }
          description={
            searchQuery
              ? "Try adjusting your search query or clear the filter."
              : "Create your first collaborative room to invite teammates and start coding together."
          }
          actionLabel={searchQuery ? undefined : "Create Workspace"}
          onAction={searchQuery ? undefined : () => setCreateRoomOpen(true)}
          secondaryActionLabel={searchQuery ? "Clear search" : "Join by ID"}
          onSecondaryAction={
            searchQuery
              ? () => setSearchQuery("")
              : () => setJoinRoomOpen(true)
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      <CreateRoomDialog
        open={createRoomOpen}
        onOpenChange={setCreateRoomOpen}
        onSuccess={() => refetch()}
      />
      <JoinRoomDialog open={joinRoomOpen} onOpenChange={setJoinRoomOpen} />
    </div>
  );
}
