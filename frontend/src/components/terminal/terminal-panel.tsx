"use client";

import * as React from "react";
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ExecutionStatus } from "@/components/terminal/execution-status";
import { useSocket } from "@/providers/socket-provider";
import { SOCKET_EVENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { JobStatus, CompilerStreamEvent, CompilerDoneEvent } from "@/types";

interface TerminalPanelProps {
  roomId: string;
  onRunCode?: () => void;
  isRunning?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  jobId?: string | null;
  className?: string;
}

interface OutputLine {
  id: string;
  type: "stdout" | "stderr" | "system";
  text: string;
  timestamp: string;
}

/**
 * TerminalPanel — code execution & stdout/stderr console panel.
 * 
 * Features:
 * - Subscribes to Socket.IO /compiler namespace for real-time streaming output
 * - Monospace console output with color-coded stderr and system notices
 * - Header with run button, clear output, status badge, and toggle collapse
 * - Automatic scroll to bottom on new output
 */
export function TerminalPanel({
  roomId,
  onRunCode,
  isRunning = false,
  isCollapsed = false,
  onToggleCollapse,
  jobId,
  className,
}: TerminalPanelProps) {
  const { connect, disconnect } = useSocket();
  const [lines, setLines] = React.useState<OutputLine[]>([]);
  const [status, setStatus] = React.useState<JobStatus | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = React.useState<number | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-focus input when terminal becomes running
  React.useEffect(() => {
    if (isRunning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning]);

  // Set status to running when a new jobId is received
  React.useEffect(() => {
    if (jobId) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unused-expressions
      setStatus("running");
      setExecutionTimeMs(null);
    }
  }, [jobId]);

  // Auto-scroll output to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Connect to /compiler namespace and subscribe to stream events
  React.useEffect(() => {
    const socket = connect("/compiler");
    if (!socket) return;

    // Join room compiler channel
    socket.emit(SOCKET_EVENTS.compiler.JOIN, { roomId });

    const handleStdout = (data: CompilerStreamEvent) => {
      if (data.roomId !== roomId) return;
      setLines((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          type: "stdout",
          text: data.chunk,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setStatus("running");
    };

    const handleStderr = (data: CompilerStreamEvent) => {
      if (data.roomId !== roomId) return;
      setLines((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          type: "stderr",
          text: data.chunk,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setStatus("running");
    };

    const handleDone = (data: CompilerDoneEvent) => {
      setStatus(data.status);
      setExecutionTimeMs(data.executionTimeMs || null);

      // Append system summary line
      const timeStr = data.executionTimeMs ? ` in ${data.executionTimeMs}ms` : "";
      const statusText =
        data.status === "completed" && data.exitCode === 0
          ? `✓ Execution finished with exit code 0${timeStr}`
          : `✗ Execution ${data.status} (exit code: ${data.exitCode ?? "N/A"})${timeStr}`;

      setLines((prev) => {
        const next = [...prev];
        if (
          data.stderr &&
          !prev.some((l) => l.type === "stderr" && l.text.includes(data.stderr!))
        ) {
          next.push({
            id: `${Date.now()}-err-${Math.random()}`,
            type: "stderr",
            text: data.stderr,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        if (
          data.stdout &&
          !prev.some((l) => l.type === "stdout" && l.text.includes(data.stdout!))
        ) {
          next.push({
            id: `${Date.now()}-out-${Math.random()}`,
            type: "stdout",
            text: data.stdout,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        next.push({
          id: `${Date.now()}-${Math.random()}`,
          type: "system",
          text: statusText,
          timestamp: new Date().toLocaleTimeString(),
        });
        return next;
      });
    };

    socket.on(SOCKET_EVENTS.compiler.STDOUT, handleStdout);
    socket.on(SOCKET_EVENTS.compiler.STDERR, handleStderr);
    socket.on(SOCKET_EVENTS.compiler.DONE, handleDone);

    return () => {
      socket.off(SOCKET_EVENTS.compiler.STDOUT, handleStdout);
      socket.off(SOCKET_EVENTS.compiler.STDERR, handleStderr);
      socket.off(SOCKET_EVENTS.compiler.DONE, handleDone);
    };
  }, [roomId, connect]);

  const clearOutput = React.useCallback(() => {
    setLines([]);
    setStatus(null);
    setExecutionTimeMs(null);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all",
        isCollapsed ? "h-10" : "h-full min-h-36",
        className
      )}
    >
      {/* Top Header Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-3 bg-[hsl(var(--gray-2))/0.5]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-xs font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Terminal Output
          </span>
          {status && (
            <ExecutionStatus
              status={status}
              executionTimeMs={executionTimeMs}
              className="ml-1"
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          {onRunCode && (
            <Tooltip content="Run Code (Ctrl + Enter)">
              <Button
                variant="outline"
                size="sm"
                onClick={onRunCode}
                disabled={isRunning}
                className="h-7 px-2 text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              >
                <Play className="size-3 mr-1.5 fill-current" />
                {isRunning ? "Running..." : "Run"}
              </Button>
            </Tooltip>
          )}

          <Tooltip content="Clear Output">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearOutput}
              disabled={lines.length === 0}
              className="size-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Tooltip>

          {onToggleCollapse && (
            <Tooltip content={isCollapsed ? "Expand Terminal" : "Collapse Terminal"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="size-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                {isCollapsed ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Console Output Box */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
        >
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[hsl(var(--muted-foreground))] opacity-60">
              <TerminalIcon className="size-6 mb-1.5 stroke-[1.5]" />
              <p className="text-xs">
                Click <span className="font-semibold text-[hsl(var(--foreground))]">Run</span> or press{" "}
                <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--gray-3))] px-1 py-0.5 text-[10px]">
                  Ctrl+Enter
                </kbd>{" "}
                to execute code.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    line.type === "stderr" && "text-rose-500 dark:text-rose-400 font-medium",
                    line.type === "system" &&
                      "text-[hsl(var(--muted-foreground))] italic border-l-2 border-[hsl(var(--border))] pl-2 my-1",
                    line.type === "stdout" && "text-[hsl(var(--foreground))]"
                  )}
                >
                  {line.text}
                </div>
              ))}
              {(isRunning || status === "running") && jobId && (
                <div className="flex items-center mt-1">
                  <span className="text-emerald-500 font-bold mr-2">❯</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const chunk = inputValue;
                        // Visually echo the input back
                        setLines((prev) => [
                          ...prev,
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            type: "stdout",
                            text: chunk + "\n",
                            timestamp: new Date().toISOString(),
                          },
                        ]);
                        
                        // Emit STDIN via socket
                        const socket = connect("/compiler");
                        if (socket) {
                          socket.emit("compiler:stdin", { roomId, jobId, chunk });
                        }
                        
                        setInputValue("");
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] placeholder:opacity-50 min-w-0"
                    placeholder="Type input here and press Enter..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
