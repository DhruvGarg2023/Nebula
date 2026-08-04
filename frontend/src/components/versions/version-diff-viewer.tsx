"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GitCommit,
  Loader2,
  FileCode2,
  Plus,
  Minus,
  FilePlus,
  FileMinus,
  FileEdit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { versionsApi } from "@/services/api/versions";
import { QUERY_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Version, VersionDiff, FileDiff } from "@/types";

interface VersionDiffViewerProps {
  roomId: string;
  version: Version | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VersionDiffViewer — inspects diffs between a snapshot and current workspace.
 */
export function VersionDiffViewer({
  roomId,
  version,
  isOpen,
  onClose,
}: VersionDiffViewerProps) {
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(
    null
  );

  const {
    data: diffResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.versions.diff(roomId, version?.id || ""),
    queryFn: () => {
      if (!version) throw new Error("No version selected");
      return versionsApi.getDiff(roomId, version.id);
    },
    enabled: isOpen && Boolean(version),
    staleTime: 60 * 1000,
  });

  const diffData: VersionDiff | null = React.useMemo(() => {
    if (!diffResponse) return null;
    const raw = (diffResponse as any).data ?? diffResponse;
    return raw.data?.diff || raw.diff || raw;
  }, [diffResponse]);

  const files: FileDiff[] = React.useMemo(() => {
    if (!diffData?.files) return [];
    return diffData.files;
  }, [diffData]);

  // Default select first modified/added file
  React.useEffect(() => {
    if (files.length > 0 && !selectedFileName) {
      const firstChanged =
        files.find((f) => f.status !== "unchanged") || files[0];
      setSelectedFileName(firstChanged.fileName);
    }
  }, [files, selectedFileName]);

  const activeFile = React.useMemo(() => {
    if (!selectedFileName) return files[0] || null;
    return files.find((f) => f.fileName === selectedFileName) || files[0] || null;
  }, [files, selectedFileName]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "added":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px]"
          >
            Added
          </Badge>
        );
      case "deleted":
        return (
          <Badge
            variant="outline"
            className="border-rose-500/30 bg-rose-500/10 text-rose-500 text-[10px]"
          >
            Deleted
          </Badge>
        );
      case "modified":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px]"
          >
            Modified
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-[10px]"
          >
            Unchanged
          </Badge>
        );
    }
  };

  if (!version) return null;

  const label = version.label || `Snapshot #${version.id.slice(0, 7)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <DialogHeader className="border-b border-[hsl(var(--border))] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <GitCommit className="size-4" />
              </div>
              <div>
                <DialogTitle>Snapshot Diff — {label}</DialogTitle>
                <DialogDescription>
                  Comparing changes between snapshot and your current workspace.
                </DialogDescription>
              </div>
            </div>

            {diffData && (
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                >
                  <Plus className="size-3" />
                  <span>{diffData.summary.filesAdded} files added</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-500"
                >
                  <Minus className="size-3" />
                  <span>{diffData.summary.filesDeleted} files deleted</span>
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 w-full items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <Loader2 className="size-4 animate-spin text-[hsl(var(--primary))]" />
              <span>Computing code diff...</span>
            </div>
          ) : isError || !diffData ? (
            <div className="flex h-64 w-full items-center justify-center text-xs text-rose-500">
              Failed to load diff comparison.
            </div>
          ) : files.length === 0 ? (
            <div className="flex h-64 w-full items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
              No files found in this comparison.
            </div>
          ) : (
            <>
              {/* Left Column: File Tabs */}
              <div className="w-56 shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] p-2 overflow-y-auto space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Files ({files.length})
                </div>

                {files.map((file) => {
                  const isSelected = activeFile?.fileName === file.fileName;
                  const icon =
                    file.status === "added" ? (
                      <FilePlus className="size-3.5 text-emerald-500" />
                    ) : file.status === "deleted" ? (
                      <FileMinus className="size-3.5 text-rose-500" />
                    ) : (
                      <FileEdit className="size-3.5 text-amber-500" />
                    );

                  return (
                    <button
                      key={file.fileName}
                      type="button"
                      onClick={() => setSelectedFileName(file.fileName)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-[hsl(var(--card))] font-medium text-[hsl(var(--foreground))] shadow-xs"
                          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--card)/0.5)] hover:text-[hsl(var(--foreground))]"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {icon}
                        <span className="truncate">{file.fileName}</span>
                      </div>
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          file.status === "added"
                            ? "bg-emerald-500"
                            : file.status === "deleted"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Code Line Diff */}
              <div className="flex-1 overflow-auto bg-[hsl(var(--card))] p-4 font-mono text-xs leading-relaxed select-text">
                {activeFile ? (
                  <div className="space-y-0.5">
                    <div className="mb-3 flex items-center justify-between border-b border-[hsl(var(--border))] pb-2">
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {activeFile.fileName}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {activeFile.status}
                      </Badge>
                    </div>

                    {activeFile.lines.length === 0 ? (
                      <div className="py-8 text-center font-sans text-xs text-[hsl(var(--muted-foreground))]">
                        No changes detected in this file.
                      </div>
                    ) : (
                      activeFile.lines.map((l, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex rounded-xs px-2 py-0.5",
                            l.type === "added" &&
                              "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500",
                            l.type === "removed" &&
                              "bg-rose-500/10 text-rose-400 border-l-2 border-rose-500 line-through opacity-80",
                            l.type === "unchanged" &&
                              "text-[hsl(var(--muted-foreground))]"
                          )}
                        >
                          <span className="w-8 shrink-0 select-none text-right text-[10px] text-[hsl(var(--muted-foreground)/0.6)] mr-3">
                            {l.lineNumber || idx + 1}
                          </span>
                          <span className="select-none mr-2">
                            {l.type === "added"
                              ? "+"
                              : l.type === "removed"
                                ? "-"
                                : " "}
                          </span>
                          <span className="break-all whitespace-pre-wrap">
                            {l.line}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center font-sans text-xs text-[hsl(var(--muted-foreground))]">
                    Select a file to inspect its changes.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
