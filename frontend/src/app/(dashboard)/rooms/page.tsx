"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  KeyRound,
  LayoutGrid,
  List as ListIcon,
  Globe,
  Lock,
  Users,
  Clock,
  ArrowRight,
  Code2,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { TimeAgo } from "@/components/common/time-ago";
import {
  RoomCard,
  CreateRoomDialog,
  JoinRoomDialog,
} from "@/components/dashboard";
import { roomsApi } from "@/services/api/rooms";
import { ROUTES } from "@/lib/constants";
import type { Room } from "@/types";

/**
 * All Collaborative Rooms page (/(dashboard)/rooms)
 * Supports:
 * - Real-time search query filtering
 * - Layout toggle between Grid view and Compact Table/List view
 * - Modal creation and room join flows
 */
export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = React.useState(false);

  const {
    data: roomsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["rooms", "list", { limit: 50 }],
    queryFn: () => roomsApi.list({ limit: 50, page: 1 }),
    staleTime: 30 * 1000,
  });

  const rooms: Room[] = roomsResponse?.data?.data || [];
  const totalRooms = roomsResponse?.data?.meta?.total || rooms.length;

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
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <PageHeader
        title="Collaborative Rooms"
        description="Browse all your active coding sessions, manage permissions, or create a new workspace."
        badge={
          <Badge variant="outline" className="text-xs font-mono">
            {totalRooms} {totalRooms === 1 ? "Room" : "Rooms"}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJoinRoomOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <KeyRound className="size-3.5 text-[hsl(var(--accent-9))]" />
              <span>Join by ID</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateRoomOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>New Room</span>
            </Button>
          </div>
        }
      />

      {/* ── Toolbar: Search Filter & View Mode Toggle ──────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[hsl(var(--border))] pb-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search by room name, description, or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] shadow-xs"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] shadow-xs"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <ListIcon className="size-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* ── Content: Loading / Error / Empty / Grid / List ─── */}
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
            Failed to load collaborative rooms
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          title={
            searchQuery ? "No matching rooms found" : "No rooms created yet"
          }
          description={
            searchQuery
              ? "Try using a different search query or filter."
              : "Create a new workspace or join an existing room with an invite code."
          }
          actionLabel={searchQuery ? undefined : "Create Workspace"}
          onAction={searchQuery ? undefined : () => setCreateRoomOpen(true)}
          secondaryActionLabel={searchQuery ? "Clear Search" : "Join by ID"}
          onSecondaryAction={
            searchQuery
              ? () => setSearchQuery("")
              : () => setJoinRoomOpen(true)
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      ) : (
        /* ── Compact Table / List View ─────────────────────── */
        <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs">
          <div className="divide-y divide-[hsl(var(--border))]">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                href={ROUTES.ROOM(room.id)}
                className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-[hsl(var(--muted))/0.5]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]">
                    <Code2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] truncate">
                        {room.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-mono px-1.5 py-0"
                      >
                        {room.language}
                      </Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {room.description || "No description provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                  <div className="hidden sm:flex items-center gap-1.5">
                    {room.isPublic ? (
                      <span className="flex items-center gap-1 text-[11px] text-[hsl(var(--success))]">
                        <Globe className="size-3.5" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Lock className="size-3.5" />
                        <span>Private</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>{room.membersCount ?? 1}</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-[11px]">
                    <Clock className="size-3" />
                    <TimeAgo date={room.updatedAt || room.createdAt} />
                  </div>
                  <ArrowRight className="size-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
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
