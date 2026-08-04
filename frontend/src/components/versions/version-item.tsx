"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { History, GitCommit, RotateCcw, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Version } from "@/types";

interface VersionItemProps {
  version: Version;
  onViewDiff: (version: Version) => void;
  onRestore: (version: Version) => void;
  isLatest?: boolean;
  className?: string;
}

/**
 * VersionItem — timeline card representing a room snapshot.
 *
 * Styled after GitHub / Vercel deployment and git history entries.
 */
export function VersionItem({
  version,
  onViewDiff,
  onRestore,
  isLatest = false,
  className,
}: VersionItemProps) {
  const creatorName = version.creator?.name || "System Snapshot";
  const label = version.label || `Snapshot #${version.id.slice(0, 7)}`;
  const description = version.description || "";

  let timeAgo = "";
  let fullDate = "";
  try {
    const d = new Date(version.createdAt);
    timeAgo = formatDistanceToNow(d, { addSuffix: true });
    fullDate = format(d, "PPpp");
  } catch {
    timeAgo = "recently";
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-all hover:border-[hsl(var(--border)/0.8)] hover:bg-[hsl(var(--accent)/0.03)] hover:shadow-xs",
        className
      )}
    >
      {/* Top row: badge + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--gray-2))] text-[hsl(var(--foreground))]">
            <GitCommit className="size-3.5" />
          </div>
          <span className="truncate text-xs font-semibold text-[hsl(var(--foreground))]">
            {label}
          </span>
          {isLatest && (
            <Badge
              variant="outline"
              className="h-4 px-1.5 text-[9px] font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            >
              Latest
            </Badge>
          )}
        </div>

        <Tooltip content={fullDate}>
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <Clock className="size-2.5" />
            <span>{timeAgo}</span>
          </span>
        </Tooltip>
      </div>

      {/* Description */}
      {description && (
        <p className="line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      )}

      {/* Bottom row: creator info + actions */}
      <div className="mt-1 flex items-center justify-between border-t border-[hsl(var(--border)/0.5)] pt-2 text-[11px]">
        <span className="text-[hsl(var(--muted-foreground))]">
          by <span className="font-medium text-[hsl(var(--foreground))]">{creatorName}</span>
        </span>

        <div className="flex items-center gap-1">
          <Tooltip content="View Changes (Diff)">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDiff(version)}
              className="h-7 gap-1 px-2 text-[11px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--gray-2))] hover:text-[hsl(var(--foreground))]"
            >
              <Eye className="size-3.5" />
              <span>Diff</span>
            </Button>
          </Tooltip>

          <Tooltip content="Restore room to this snapshot">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRestore(version)}
              className="h-7 gap-1 px-2 text-[11px] text-[hsl(var(--muted-foreground))] hover:bg-amber-500/10 hover:text-amber-500"
            >
              <RotateCcw className="size-3.5" />
              <span>Restore</span>
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
