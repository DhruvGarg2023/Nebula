"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  line: number;
  column: number;
}

interface CursorOverlayProps {
  cursors?: RemoteCursor[];
  className?: string;
}

/**
 * CursorOverlay — displays remote collaborator cursors & name tags.
 * 
 * Used alongside Yjs awareness to visually highlight where remote users
 * are currently editing in the active document.
 */
export function CursorOverlay({
  cursors = [],
  className,
}: CursorOverlayProps) {
  if (cursors.length === 0) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-20 overflow-hidden", className)}>
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute flex flex-col items-start transition-all duration-100 ease-out"
          style={{
            // Approximate position calculation when rendered above editor
            // In full Yjs-monaco integration, y-monaco handles native line decorations
            top: `${(cursor.line - 1) * 19}px`,
            left: `${(cursor.column - 1) * 7.5}px`,
          }}
        >
          {/* Vertical cursor caret */}
          <div
            className="h-4 w-0.5"
            style={{ backgroundColor: cursor.color || "hsl(var(--accent-9))" }}
          />

          {/* User name tag badge */}
          <div
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm whitespace-nowrap"
            style={{ backgroundColor: cursor.color || "hsl(var(--accent-9))" }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
}
