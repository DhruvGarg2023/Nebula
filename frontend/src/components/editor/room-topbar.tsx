"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Settings,
  Share2,
  Lock,
  Globe,
  Sun,
  Moon,
  Command,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { PresenceAvatars, type PresenceMember } from "@/components/common/presence-avatars";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Room } from "@/types";

interface RoomTopbarProps {
  room: Room;
  onlineMembers: PresenceMember[];
  onOpenInvite?: () => void;
  onOpenMembers?: () => void;
  canManage?: boolean;
  className?: string;
}

/**
 * RoomTopbar — header navigation bar for Room Workspace.
 * 
 * Styled after Linear / Vercel workspace header:
 * - Back link to rooms dashboard
 * - Room title & public/private badge
 * - Stacked real-time collaborator avatars
 * - Members & Share buttons
 * - Settings gear (if admin)
 * - ⌘K Command Palette trigger & theme switcher
 */
export function RoomTopbar({
  room,
  onlineMembers,
  onOpenInvite,
  onOpenMembers,
  canManage = false,
  className,
}: RoomTopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        "flex h-12 w-full shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 select-none",
        className
      )}
    >
      {/* Left Section: Back Link & Room Info */}
      <div className="flex items-center gap-3">
        <Tooltip content="Back to Rooms">
          <Link
            href={ROUTES.ROOMS}
            className="flex size-7 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <ArrowLeft className="size-4" />
          </Link>
        </Tooltip>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {room.name}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
            {room.isPublic ? (
              <>
                <Globe className="size-3 text-emerald-500" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="size-3 text-amber-500" />
                <span>Private</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right Section: Presence, Actions, Theme */}
      <div className="flex items-center gap-2">
        {/* Real-time online avatars */}
        <PresenceAvatars members={onlineMembers} className="mr-2" />

        {/* Members Button */}
        {onOpenMembers && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenMembers}
            className="h-8 gap-1.5 px-3 text-xs font-medium border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.04)]"
          >
            <Users className="size-3.5" />
            <span>Members</span>
          </Button>
        )}

        {/* Share / Invite Button */}
        {onOpenInvite && (
          <Button
            size="sm"
            onClick={onOpenInvite}
            className="h-8 gap-1.5 px-3 text-xs font-medium bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </Button>
        )}

        {/* Room Settings Link (Admins only) */}
        {canManage && (
          <Tooltip content="Room Settings">
            <Link href={ROUTES.ROOM_SETTINGS(room.id)}>
              <Button
                variant="outline"
                size="icon"
                className="size-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <Settings className="size-4" />
              </Button>
            </Link>
          </Tooltip>
        )}

        {/* Command Palette Trigger */}
        <Tooltip content="Command Palette (Ctrl + K)">
          <button
            type="button"
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                ctrlKey: true,
              });
              window.dispatchEvent(event);
            }}
            className="flex size-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <Command className="size-4" />
          </button>
        </Tooltip>

        {/* Theme Switcher Button */}
        <Tooltip content={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
