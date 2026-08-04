"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Loader2 } from "lucide-react";
import { useSocket } from "@/providers/socket-provider";
import { chatApi } from "@/services/api/chat";
import { QUERY_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";

interface ChatPanelProps {
  roomId: string;
  currentUserId?: string;
  className?: string;
}

/**
 * ChatPanel — real-time collaborative chat for Room Workspace.
 *
 * Integrates Socket.IO /chat namespace with message history persistence.
 */
export function ChatPanel({
  roomId,
  currentUserId,
  className,
}: ChatPanelProps) {
  const queryClient = useQueryClient();
  const { connect, disconnect, getSocket } = useSocket();
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const [typingUsers, setTypingUsers] = React.useState<
    { userId: string; userName: string }[]
  >([]);

  // ── 1. Fetch History via REST ────────────────────────────────
  const {
    data: historyRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.chat.messages(roomId),
    queryFn: () => chatApi.getHistory(roomId, { limit: 100 }),
    staleTime: 10 * 1000,
  });

  const messages: Message[] = React.useMemo(() => {
    if (!historyRes) return [];
    const raw = (historyRes as any).data ?? historyRes;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.messages)) return raw.data.messages;
    if (Array.isArray(raw.messages)) return raw.messages;
    return [];
  }, [historyRes]);

  // Sort messages chronologically oldest to newest
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const scrollToBottom = React.useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Scroll to bottom on load
  React.useEffect(() => {
    scrollToBottom(false);
  }, [sortedMessages.length, scrollToBottom]);

  // ── 2. Socket.IO /chat namespace connection ──────────────────
  React.useEffect(() => {
    const socket = connect("/chat");
    if (!socket) return;

    // Join room chat channel
    socket.emit("chat:join", { roomId }, (res?: any) => {
      // optional join ack
    });

    // Handle receiving new message
    const handleReceiveMessage = (msg: Message) => {
      queryClient.setQueryData(
        QUERY_KEYS.chat.messages(roomId),
        (old: any) => {
          const oldList: Message[] = Array.isArray(old?.data)
            ? old.data
            : Array.isArray(old)
              ? old
              : [];
          // Avoid duplicates
          if (oldList.some((m) => m.id === msg.id)) return old;
          return { data: [...oldList, msg] };
        }
      );
      setTimeout(() => scrollToBottom(true), 50);
    };

    const handleTypingStart = (payload: {
      userId: string;
      userName: string;
      roomId: string;
    }) => {
      if (payload.roomId !== roomId || payload.userId === currentUserId) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === payload.userId)) return prev;
        return [
          ...prev,
          {
            userId: payload.userId,
            userName: payload.userName || "Collaborator",
          },
        ];
      });
    };

    const handleTypingStop = (payload: { userId: string; roomId: string }) => {
      if (payload.roomId !== roomId) return;
      setTypingUsers((prev) =>
        prev.filter((u) => u.userId !== payload.userId)
      );
    };

    socket.on("chat:receive", handleReceiveMessage);
    socket.on("chat:typing:start", handleTypingStart);
    socket.on("chat:typing:stop", handleTypingStop);

    return () => {
      socket.off("chat:receive", handleReceiveMessage);
      socket.off("chat:typing:start", handleTypingStart);
      socket.off("chat:typing:stop", handleTypingStop);
      disconnect("/chat");
    };
  }, [roomId, currentUserId, connect, disconnect, queryClient, scrollToBottom]);

  // ── 3. Send Message Handler ──────────────────────────────────
  const handleSendMessage = async (content: string) => {
    const socket = getSocket("/chat");
    if (!socket || !socket.connected) {
      // Reconnect if dropped
      const reSocket = connect("/chat");
      if (!reSocket) return;
      reSocket.emit("chat:send", { roomId, content });
      return;
    }

    return new Promise<void>((resolve, reject) => {
      socket.emit(
        "chat:send",
        { roomId, content },
        (response?: { success: boolean; error?: string }) => {
          if (response && !response.success) {
            reject(new Error(response.error || "Failed to send message"));
          } else {
            resolve();
          }
        }
      );
    });
  };

  const handleTypingStart = () => {
    const socket = getSocket("/chat");
    if (socket?.connected) {
      socket.emit("chat:typing:start", { roomId });
    }
  };

  const handleTypingStop = () => {
    const socket = getSocket("/chat");
    if (socket?.connected) {
      socket.emit("chat:typing:stop", { roomId });
    }
  };

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
          <MessageSquare className="size-3.5 text-[hsl(var(--primary))]" />
          <span>Room Chat</span>
        </div>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {sortedMessages.length} messages
        </span>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-2 select-text">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Loader2 className="size-4 animate-spin text-[hsl(var(--primary))]" />
            <span>Loading chat history...</span>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-xs text-rose-500">
            Failed to load chat messages.
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-[hsl(var(--muted-foreground))]">
            <MessageSquare className="size-6 text-[hsl(var(--muted-foreground)/0.4)]" />
            <span className="font-medium">No messages yet</span>
            <span className="text-[11px]">
              Start the conversation with your collaborators!
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            {sortedMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Composition Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}
