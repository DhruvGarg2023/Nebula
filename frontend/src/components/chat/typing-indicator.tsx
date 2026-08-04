"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
  className?: string;
}

/**
 * TypingIndicator — animated bouncy dots with names of users currently typing.
 *
 * Designed to match Linear / Vercel subtle micro-animations.
 */
export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName);
  let label = "";
  if (names.length === 1) {
    label = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing...`;
  } else {
    label = `${names.length} users are typing...`;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition-opacity animate-in fade-in-50",
        className
      )}
    >
      <div className="flex items-center gap-0.5">
        <span
          className="size-1.5 rounded-full bg-[hsl(var(--primary))] animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-[hsl(var(--primary))] animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-[hsl(var(--primary))] animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="truncate font-medium">{label}</span>
    </div>
  );
}
