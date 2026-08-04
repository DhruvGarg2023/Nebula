"use client";

import * as React from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void> | void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * ChatInput — message composition box for Room Workspace Chat.
 *
 * Supports Shift+Enter for new lines, Enter to submit, and typing indicator debounce.
 */
export function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  className,
}: ChatInputProps) {
  const [content, setContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = React.useRef(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Typing debounce logic
    if (onTypingStart && onTypingStop) {
      if (!isTypingRef.current && val.trim().length > 0) {
        isTypingRef.current = true;
        onTypingStart();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          onTypingStop();
        }
      }, 1500);
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting || disabled) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current && onTypingStop) {
      isTypingRef.current = false;
      onTypingStop();
    }

    try {
      setIsSubmitting(true);
      await onSendMessage(trimmed);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-end gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5",
        className
      )}
    >
      <textarea
        value={content}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        disabled={disabled || isSubmitting}
        rows={1}
        className="max-h-24 min-h-[36px] w-full resize-none rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
      />

      <Button
        size="icon"
        onClick={handleSend}
        disabled={!content.trim() || disabled || isSubmitting}
        className="size-9 shrink-0 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
      >
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  );
}
