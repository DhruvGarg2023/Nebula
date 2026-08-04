"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/providers/socket-provider";
import { SOCKET_EVENTS } from "@/lib/constants";
import { CursorOverlay, type RemoteCursor } from "@/components/editor/cursor-overlay";
import { cn } from "@/lib/utils";

// Skeleton shown while Monaco is loading
export function EditorSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="size-6 animate-spin text-[hsl(var(--accent-9))]" />
        <span className="text-xs font-medium">Loading Code Editor...</span>
      </div>
    </div>
  );
}

// Dynamically import Monaco Editor with ssr: false per Section 14
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

export interface CodeEditorProps {
  roomId: string;
  fileId: string;
  value: string;
  language: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onRunCode?: () => void;
  readOnly?: boolean;
  cursors?: RemoteCursor[];
  className?: string;
}

/**
 * CodeEditor — Monaco Editor wrapper for collaborative coding.
 * 
 * Features:
 * - Dynamic SSR-safe import of @monaco-editor/react
 * - Auto-switches theme (vs-dark / vs-light) based on next-themes
 * - Ctrl+S shortcut to save file
 * - Ctrl+Enter shortcut to run code
 * - Remote collaborator cursors & selection badges
 * - Syncs editor changes with Socket.IO /editor namespace
 */
export function CodeEditor({
  roomId,
  fileId,
  value,
  language,
  onChange,
  onSave,
  onRunCode,
  readOnly = false,
  cursors = [],
  className,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const { connect } = useSocket();
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  // Connect to /editor socket namespace and emit join
  React.useEffect(() => {
    const socket = connect("/editor");
    if (!socket) return;

    socket.emit(SOCKET_EVENTS.editor.JOIN, { roomId, fileId });

    return () => {
      // Clean up listeners when switching files
      socket.off(SOCKET_EVENTS.editor.CHANGE);
    };
  }, [roomId, fileId, connect]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Ctrl+S / Cmd+S for Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });

    // Ctrl+Enter / Cmd+Enter for Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) onRunCode();
    });

    // Enable screen reader accessibility support per Section 15
    editor.updateOptions({
      accessibilitySupport: "on",
    });
  };

  const monacoTheme = theme === "dark" ? "vs-dark" : "light";

  return (
    <div className={cn("relative flex-1 w-full h-full overflow-hidden", className)}>
      <CursorOverlay cursors={cursors} />
      <MonacoEditor
        height="100%"
        width="100%"
        language={language}
        theme={monacoTheme}
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          fontSize: 14,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
