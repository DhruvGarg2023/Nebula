"use client";

import * as React from "react";
import {
  Play,
  Sparkles,
  AlignLeft,
  Save,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { LanguageSelector } from "@/components/editor/language-selector";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRunCode?: () => void;
  onFormatCode?: () => void;
  onAiReview?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  isDirty?: boolean;
  isRunning?: boolean;
  canEdit?: boolean;
  className?: string;
}

/**
 * EditorToolbar — action toolbar above Monaco Editor.
 * 
 * Includes:
 * - Run code (▶)
 * - Format code
 * - AI Review trigger (Sparkles icon)
 * - Language picker
 * - Save status indicator (Dirty dot / Saving spinner / Saved check)
 */
export function EditorToolbar({
  language,
  onLanguageChange,
  onRunCode,
  onFormatCode,
  onAiReview,
  isSaving = false,
  isSaved = true,
  isDirty = false,
  isRunning = false,
  canEdit = true,
  className,
}: EditorToolbarProps) {
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.4] px-3",
        className
      )}
    >
      {/* Left section: Save status & Actions */}
      <div className="flex items-center gap-2">
        {/* Save Status Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs text-[hsl(var(--muted-foreground))]">
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-[hsl(var(--accent-9))]" />
              <span>Saving...</span>
            </>
          ) : isDirty ? (
            <>
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="size-3.5 text-emerald-500" />
              <span>Saved</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Right section: Tools & Language */}
      <div className="flex items-center gap-1.5">
        {/* Format Code */}
        {onFormatCode && (
          <Tooltip content="Format Code (Shift + Alt + F)">
            <Button
              variant="ghost"
              size="sm"
              onClick={onFormatCode}
              disabled={!canEdit}
              className="h-7 px-2.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <AlignLeft className="size-3.5 mr-1" />
              Format
            </Button>
          </Tooltip>
        )}

        {/* AI Review button */}
        {onAiReview && (
          <Tooltip content="Run AI Code Review">
            <Button
              variant="outline"
              size="sm"
              onClick={onAiReview}
              className="h-7 px-2.5 text-xs font-medium border-[hsl(var(--accent-6))] bg-[hsl(var(--accent-3))/0.3] text-[hsl(var(--accent-11))] hover:bg-[hsl(var(--accent-3))]"
            >
              <Sparkles className="size-3.5 mr-1 text-[hsl(var(--accent-9))]" />
              AI Review
            </Button>
          </Tooltip>
        )}

        {/* Run Code */}
        {onRunCode && (
          <Tooltip content="Execute Code (Ctrl + Enter)">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunCode}
              disabled={isRunning}
              className="h-7 px-2.5 text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            >
              <Play className="size-3 mr-1.5 fill-current" />
              {isRunning ? "Running..." : "Run"}
            </Button>
          </Tooltip>
        )}

        {/* Language selector */}
        <LanguageSelector
          value={language}
          onChange={onLanguageChange}
          disabled={!canEdit}
        />
      </div>
    </div>
  );
}
