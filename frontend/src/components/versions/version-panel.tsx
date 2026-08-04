"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Plus, Loader2, GitCommit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { versionsApi } from "@/services/api/versions";
import { QUERY_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Version } from "@/types";
import { VersionItem } from "./version-item";
import { CreateSnapshotDialog } from "./create-snapshot-dialog";
import { RestoreDialog } from "./restore-dialog";
import { VersionDiffViewer } from "./version-diff-viewer";

interface VersionPanelProps {
  roomId: string;
  className?: string;
}

/**
 * VersionPanel — snapshot history timeline for Room Workspace.
 */
export function VersionPanel({ roomId, className }: VersionPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [diffVersion, setDiffVersion] = React.useState<Version | null>(null);
  const [restoreVersion, setRestoreVersion] = React.useState<Version | null>(null);

  const {
    data: versionsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.versions.all(roomId),
    queryFn: () => versionsApi.list(roomId, { limit: 50 }),
    staleTime: 15 * 1000,
  });

  const versions: Version[] = React.useMemo(() => {
    if (!versionsResponse) return [];
    const raw = (versionsResponse as any).data ?? versionsResponse;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.versions)) return raw.data.versions;
    if (Array.isArray(raw.versions)) return raw.versions;
    return [];
  }, [versionsResponse]);

  const sortedVersions = React.useMemo(() => {
    return [...versions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [versions]);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-[hsl(var(--card))] text-[hsl(var(--foreground))]",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-3 select-none">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <History className="size-3.5 text-[hsl(var(--primary))]" />
          <span>Version History</span>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-6 gap-1 px-2 text-[11px] bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="size-3" />
          <span>Snapshot</span>
        </Button>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Loader2 className="size-4 animate-spin text-[hsl(var(--primary))]" />
            <span>Loading snapshots...</span>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-xs text-rose-500">
            Failed to load version history.
          </div>
        ) : sortedVersions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center text-xs text-[hsl(var(--muted-foreground))]">
            <GitCommit className="size-6 text-[hsl(var(--muted-foreground)/0.4)]" />
            <span className="font-medium">No snapshots recorded</span>
            <span className="text-[11px] max-w-xs">
              Click Snapshot above to freeze and label your room code at any time.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedVersions.map((ver, idx) => (
              <VersionItem
                key={ver.id}
                version={ver}
                isLatest={idx === 0}
                onViewDiff={(v) => setDiffVersion(v)}
                onRestore={(v) => setRestoreVersion(v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateSnapshotDialog
        roomId={roomId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <VersionDiffViewer
        roomId={roomId}
        version={diffVersion}
        isOpen={Boolean(diffVersion)}
        onClose={() => setDiffVersion(null)}
      />

      <RestoreDialog
        roomId={roomId}
        version={restoreVersion}
        isOpen={Boolean(restoreVersion)}
        onClose={() => setRestoreVersion(null)}
      />
    </div>
  );
}
