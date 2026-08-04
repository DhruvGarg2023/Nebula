"use client";

import * as React from "react";
import {
  FileCode,
  FilePlus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { cn } from "@/lib/utils";
import type { CodeFile } from "@/types";

interface FileExplorerProps {
  files: CodeFile[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, language: string) => Promise<void>;
  onRenameFile?: (fileId: string, newName: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  isLoading?: boolean;
  canEdit?: boolean;
  className?: string;
}

/**
 * FileExplorer — file tree sidebar for Room Workspace.
 * 
 * Features:
 * - Lists room files sorted alphabetically
 * - Inline new file creation input
 * - Inline file renaming
 * - Deletion with ConfirmDialog safety
 * - Active file left-border highlight indicator
 */
export function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  isLoading = false,
  canEdit = true,
  className,
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState("");
  const [selectedLang, setSelectedLang] = React.useState("cpp");
  const [creatingLoading, setCreatingLoading] = React.useState(false);

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [renamingLoading, setRenamingLoading] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<CodeFile | null>(null);
  const [deletingLoading, setDeletingLoading] = React.useState(false);

  const safeFiles = React.useMemo(
    () => (Array.isArray(files) ? files : []),
    [files]
  );

  const getExtensionForLang = (lang: string): string => {
    switch (lang) {
      case "c":
        return ".c";
      case "cpp":
        return ".cpp";
      case "python":
        return ".py";
      case "javascript":
        return ".js";
      default:
        return ".js";
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    try {
      setCreatingLoading(true);
      let name = newFileName.trim();
      const expectedExt = getExtensionForLang(selectedLang);
      if (!name.includes(".")) {
        name = `${name}${expectedExt}`;
      }
      await onCreateFile(name, selectedLang);
      setNewFileName("");
      setIsCreating(false);
    } finally {
      setCreatingLoading(false);
    }
  };

  const handleRenameSubmit = async (fileId: string) => {
    if (!renameValue.trim() || !onRenameFile) {
      setRenamingId(null);
      return;
    }
    try {
      setRenamingLoading(true);
      await onRenameFile(fileId, renameValue.trim());
      setRenamingId(null);
    } finally {
      setRenamingLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingLoading(true);
      await onDeleteFile(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] select-none",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-3 bg-[hsl(var(--gray-2))/0.4]">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-xs font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Files
          </span>
          <span className="rounded-full bg-[hsl(var(--gray-3))] px-1.5 py-0.2 text-[10px] text-[hsl(var(--muted-foreground))] font-medium">
            {files.length}
          </span>
        </div>

        {canEdit && (
          <Tooltip content="New File">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCreating(true)}
              className="size-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <FilePlus className="size-3.5" />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Inline Create Input */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-1.5 rounded-md border border-[hsl(var(--accent-6))] bg-[hsl(var(--accent-3))/0.3] p-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Lang:
              </span>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                disabled={creatingLoading}
                className="h-6 flex-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent-9))]"
              >
                <option value="c">C (.c)</option>
                <option value="cpp">C++ (.cpp)</option>
                <option value="python">Python (.py)</option>
                <option value="javascript">JavaScript (.js)</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCode className="size-3.5 shrink-0 text-[hsl(var(--accent-9))]" />
              <Input
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={
                  selectedLang === "cpp"
                    ? "main.cpp"
                    : selectedLang === "c"
                    ? "main.c"
                    : selectedLang === "python"
                    ? "script.py"
                    : "script.js"
                }
                className="h-6 text-xs px-1.5 flex-1"
                disabled={creatingLoading}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={creatingLoading}
                className="size-6 shrink-0 text-emerald-500 hover:text-emerald-400"
              >
                {creatingLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="size-6 shrink-0 text-[hsl(var(--muted-foreground))]"
              >
                <X className="size-3" />
              </Button>
            </div>
          </form>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-1.5 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 w-full animate-pulse rounded bg-[hsl(var(--gray-3))]"
              />
            ))}
          </div>
        ) : safeFiles.length === 0 && !isCreating ? (
          <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))] opacity-75">
            No files in room.
            <br />
            Click (+) to create one.
          </div>
        ) : (
          safeFiles.map((file) => {
            const isActive = file.id === activeFileId;
            const isRenaming = renamingId === file.id;

            return (
              <div
                key={file.id}
                className={cn(
                  "group relative flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-[hsl(var(--accent-3))/0.4] font-medium text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--gray-3))/0.5] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {/* Active Left Accent Border */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[hsl(var(--accent-9))]" />
                )}

                {isRenaming ? (
                  <div className="flex flex-1 items-center gap-1">
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(file.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="h-6 text-xs px-1"
                      disabled={renamingLoading}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRenameSubmit(file.id)}
                      className="size-5 shrink-0 text-emerald-500"
                    >
                      <Check className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRenamingId(null)}
                      className="size-5 shrink-0 text-[hsl(var(--muted-foreground))]"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => onSelectFile(file.id)}
                      className="flex flex-1 cursor-pointer items-center gap-2 truncate"
                    >
                      <FileCode className="size-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{file.name}</span>
                    </div>

                    {/* Actions on Hover */}
                    {canEdit && (
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        {onRenameFile && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(file.id);
                              setRenameValue(file.name);
                            }}
                            className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--gray-4))] hover:text-[hsl(var(--foreground))]"
                            title="Rename"
                          >
                            <Edit2 className="size-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(file);
                          }}
                          className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:bg-rose-500/10 hover:text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete File?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete File"
        variant="destructive"
        isLoading={deletingLoading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
