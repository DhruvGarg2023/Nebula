"use client";

import * as React from "react";
import { format } from "date-fns";
import { Sparkles, Info } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
  currentUserId?: string;
  className?: string;
}

/**
 * ChatMessage — single chat bubble or system message in Room workspace.
 *
 * Styled after Linear / Vercel workspace comments and activity feed.
 */
export function ChatMessage({
  message,
  currentUserId,
  className,
}: ChatMessageProps) {
  const isSystem = message.type === "SYSTEM";
  const isOwn = Boolean(currentUserId && message.userId === currentUserId);

  if (isSystem) {
    return (
      <div
        className={cn(
          "my-2 flex items-center justify-center gap-1.5 px-4 py-1 text-center text-[11px] font-medium text-[hsl(var(--muted-foreground))]",
          className
        )}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] px-2.5 py-0.5">
          <Info className="size-3 text-[hsl(var(--primary))]" />
          <span>{message.content}</span>
        </span>
      </div>
    );
  }

  const senderName = message.user?.name || "Anonymous";
  const avatarUrl = message.user?.avatarUrl || "";
  const initials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  let formattedTime = "";
  try {
    formattedTime = format(new Date(message.createdAt), "h:mm a");
  } catch {
    formattedTime = "";
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-3 py-1.5 transition-colors hover:bg-[hsl(var(--accent)/0.04)]",
        isOwn && "bg-[hsl(var(--accent)/0.02)]",
        className
      )}
    >
      <Avatar
        src={avatarUrl}
        alt={senderName}
        name={senderName}
        size="sm"
        className="size-7 shrink-0 border border-[hsl(var(--border))]"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={cn(
                "truncate text-xs font-semibold text-[hsl(var(--foreground))]",
                isOwn && "text-[hsl(var(--primary))]"
              )}
            >
              {senderName}
            </span>
            {isOwn && (
              <span className="rounded bg-[hsl(var(--primary)/0.1)] px-1 py-0.2 text-[9px] font-medium text-[hsl(var(--primary))]">
                You
              </span>
            )}
          </div>
          {formattedTime && (
            <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">
              {formattedTime}
            </span>
          )}
        </div>

        <div className="break-words text-xs leading-relaxed text-[hsl(var(--foreground))] select-text">
          {message.content}
        </div>
      </div>
    </div>
  );
}
