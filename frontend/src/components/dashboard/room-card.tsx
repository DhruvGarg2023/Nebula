"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  Users,
  Clock,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimeAgo } from "@/components/common/time-ago";
import { ROUTES } from "@/lib/constants";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  index?: number;
}

/**
 * Returns color-coded language badge variant and label.
 */
function getLanguageBadge(language: string) {
  const lang = language.toLowerCase();
  switch (lang) {
    case "javascript":
    case "js":
      return { label: "JS", variant: "warning" as const, name: "JavaScript" };
    case "typescript":
    case "ts":
      return { label: "TS", variant: "info" as const, name: "TypeScript" };
    case "python":
    case "py":
      return { label: "PY", variant: "success" as const, name: "Python 3" };
    case "go":
      return { label: "GO", variant: "info" as const, name: "Go 1.21" };
    case "rust":
    case "rs":
      return { label: "RS", variant: "error" as const, name: "Rust" };
    case "cpp":
    case "c++":
      return { label: "C++", variant: "accent" as const, name: "C++ (GCC)" };
    case "java":
      return { label: "JAVA", variant: "warning" as const, name: "Java 21" };
    case "html":
      return { label: "HTML", variant: "accent" as const, name: "HTML5 / Web" };
    default:
      return { label: language.toUpperCase().slice(0, 4), variant: "default" as const, name: language };
  }
}

/**
 * Enterprise RoomCard component inspired by Vercel & GitHub project cards.
 * Features staggered entrance animations, language badge, privacy indicator,
 * and member count with time-ago timestamp.
 */
export function RoomCard({ room, index = 0 }: RoomCardProps) {
  const langInfo = getLanguageBadge(room.language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: Math.min(index * 0.05, 0.3),
      }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs transition-all duration-200 hover:border-[hsl(var(--border-hover))] hover:shadow-md"
    >
      <div>
        {/* Top Header Row: Language Badge + Privacy Indicator */}
        <div className="flex items-center justify-between">
          <Badge
            variant={langInfo.variant}
            className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
          >
            {langInfo.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            {room.isPublic ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--success))]">
                <Globe className="size-3.5" />
                <span>Public</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                <Lock className="size-3.5" />
                <span>Private</span>
              </span>
            )}
          </div>
        </div>

        {/* Room Title */}
        <Link
          href={ROUTES.ROOM(room.id)}
          className="mt-3.5 block text-base font-semibold text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))] truncate"
        >
          {room.name}
        </Link>

        {/* Room Description */}
        <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 min-h-[32px]">
          {room.description || "No description provided for this collaborative workspace."}
        </p>
      </div>

      {/* Bottom Footer Row: Member Count & Last Active Timestamp */}
      <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))/0.6] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-[hsl(var(--accent-9))]" />
          <span className="font-medium">
            {room.membersCount ?? 1} {room.membersCount === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="size-3" />
          <TimeAgo date={room.updatedAt || room.createdAt} />
        </div>
      </div>
    </motion.div>
  );
}
