"use client";

import * as React from "react";
import { X, FileCode2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CodeFile } from "@/types";

export interface OpenFileTab {
  id: string;
  name: string;
  language: string;
  isDirty?: boolean;
}

interface EditorTabsProps {
  files: OpenFileTab[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string, e: React.MouseEvent) => void;
  onNewFile?: () => void;
  className?: string;
}

/**
 * EditorTabs — horizontal tab bar for open code files.
 * 
 * Styled after VS Code / Linear editor header:
 * - Active tab border indicator
 * - Unsaved changes dot indicator
 * - Close tab button (×)
 * - Quick new file (+) button
 */
export function EditorTabs({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
  onNewFile,
  className,
}: EditorTabsProps) {
  const safeFiles = Array.isArray(files) ? files : [];

  if (safeFiles.length === 0) {
    return (
      <div
        className={cn(
          "flex h-9 shrink-0 items-center border-b border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.6] px-3 text-xs text-[hsl(var(--muted-foreground))]",
          className
        )}
      >
        No files open
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 shrink-0 items-center border-b border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.6] overflow-x-auto no-scrollbar",
        className
      )}
    >
      <div className="flex h-full items-center">
        {safeFiles.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={cn(
                "group relative flex h-full cursor-pointer items-center gap-2 border-r border-[hsl(var(--border))] px-3 text-xs transition-colors",
                isActive
                  ? "bg-[hsl(var(--card))] font-medium text-[hsl(var(--foreground))] shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--card))/0.5] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {/* Active tab bottom indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--accent-9))]" />
              )}

              <FileCode2 className="size-3.5 opacity-70" />
              <span className="truncate max-w-32">{file.name}</span>

              {/* Unsaved Dot or Close Button */}
              <div className="flex items-center">
                {file.isDirty && (
                  <span className="size-1.5 rounded-full bg-amber-500 mr-1 group-hover:hidden" />
                )}
                <button
                  type="button"
                  onClick={(e) => onCloseFile(file.id, e)}
                  className={cn(
                    "rounded p-0.5 transition-colors hover:bg-[hsl(var(--gray-4))] hover:text-[hsl(var(--foreground))]",
                    !file.isDirty && "opacity-0 group-hover:opacity-100",
                    isActive && "opacity-100"
                  )}
                  title="Close (Alt + W)"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick new file button */}
      {onNewFile && (
        <Tooltip content="New File (Alt + N)">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewFile}
            className="size-7 ml-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <Plus className="size-3.5" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
