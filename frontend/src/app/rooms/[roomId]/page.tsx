"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Group,
  Panel,
  Separator,
  type PanelSize,
} from "react-resizable-panels";
import {
  FileCode2,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Terminal as TerminalIcon,
  MessageSquare,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoom } from "./layout";
import { useAuth } from "@/providers/auth-provider";
import {
  FileExplorer,
  EditorTabs,
  EditorToolbar,
  CodeEditor,
  type OpenFileTab,
} from "@/components/editor";
import { TerminalPanel } from "@/components/terminal";
import { ChatPanel } from "@/components/chat";
import { VersionPanel } from "@/components/versions";
import { filesApi } from "@/services/api/files";
import { compilerApi } from "@/services/api/compiler";
import { QUERY_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CodeFile } from "@/types";

/**
 * Safely extracts an array of CodeFile from any API response shape
 * (handles { data: { files: [...] } }, { data: [...] }, or raw arrays).
 */
function extractFilesArray(res: any): CodeFile[] {
  if (!res) return [];
  const raw = res.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.files)) return raw.data.files;
  if (Array.isArray(raw.files)) return raw.files;
  return [];
}

/**
 * Safely extracts a single CodeFile from an API response shape
 * (handles { data: { file: { ... } } } or { data: { ... } }).
 */
function extractSingleFile(res: any): CodeFile {
  const raw = res?.data ?? res;
  if (raw?.data?.file) return raw.data.file;
  if (raw?.file) return raw.file;
  if (raw?.data) return raw.data;
  return raw;
}

/**
 * RoomWorkspacePage — Core multi-panel collaborative coding workspace.
 * 
 * Features:
 * - Resizable multi-panel layout using react-resizable-panels v3 (Group / Panel / Separator)
 * - File CRUD operations (Create, Read, Rename, Delete) with React Query
 * - Multi-file tab bar with unsaved changes tracking
 * - Real-time Monaco CodeEditor with Yjs support
 * - Integrated terminal console with streaming execution output
 */
export default function RoomWorkspacePage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const queryClient = useQueryClient();
  const { canEdit, isLoading: isRoomLoading } = useRoom();
  const { user } = useAuth();

  // ── UI Collapse States ─────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = React.useState(false);
  const [bottomTab, setBottomTab] = React.useState<"terminal" | "chat" | "versions">("terminal");

  // ── Open Files & Active File State ─────────────────────────
  const [openFiles, setOpenFiles] = React.useState<OpenFileTab[]>([]);
  const [activeFileId, setActiveFileId] = React.useState<string | null>(null);
  const [unsavedContents, setUnsavedContents] = React.useState<
    Record<string, string>
  >({});
  const [currentJobId, setCurrentJobId] = React.useState<string | null>(null);

  // ── Fetch Files ─────────────────────────────────────────────
  const {
    data: filesResponse,
    isLoading: isFilesLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.files.all(roomId),
    queryFn: () => filesApi.list(roomId),
    enabled: !!roomId,
  });

  const files: CodeFile[] = React.useMemo(
    () => extractFilesArray(filesResponse),
    [filesResponse]
  );

  // Auto-open and select the first file on initial load if none active
  React.useEffect(() => {
    if (files.length > 0 && openFiles.length === 0) {
      const first = files[0];
      setOpenFiles([
        {
          id: first.id,
          name: first.name,
          language: first.language,
          isDirty: false,
        },
      ]);
      setActiveFileId(first.id);
    }
  }, [files, openFiles.length]);

  // Current active file object
  const activeFile = React.useMemo(() => {
    if (!activeFileId) return null;
    return files.find((f: CodeFile) => f.id === activeFileId) || null;
  }, [files, activeFileId]);

  // Current code content (either unsaved buffer or server content)
  const currentContent = React.useMemo(() => {
    if (!activeFileId || !activeFile) return "";
    return unsavedContents[activeFileId] ?? activeFile.content ?? "";
  }, [activeFileId, activeFile, unsavedContents]);

  // ── File Mutations ──────────────────────────────────────────
  const createFileMutation = useMutation({
    mutationFn: async ({
      name,
      language,
    }: {
      name: string;
      language: string;
    }) => {
      let initialContent = `// ${name}\nconsole.log("Hello World");\n`;
      if (language === "cpp") {
        initialContent = `// ${name}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}\n`;
      } else if (language === "c") {
        initialContent = `// ${name}\n#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}\n`;
      } else if (language === "python") {
        initialContent = `# ${name}\nprint("Hello World")\n`;
      }
      return filesApi.create(roomId, {
        name,
        language,
        content: initialContent,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all(roomId) });
      const newFile: CodeFile = extractSingleFile(res);
      setOpenFiles((prev) => {
        if (prev.some((f) => f.id === newFile.id)) return prev;
        return [
          ...prev,
          {
            id: newFile.id,
            name: newFile.name,
            language: newFile.language,
            isDirty: false,
          },
        ];
      });
      setActiveFileId(newFile.id);
      toast.success("File created");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to create file. Try again."
      );
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      content,
    }: {
      fileId: string;
      content: string;
    }) => {
      return filesApi.update(roomId, fileId, { content });
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(QUERY_KEYS.files.all(roomId), (old: any) => {
        if (!old) return old;
        const oldFiles = extractFilesArray(old);
        const updatedFiles = oldFiles.map((f: CodeFile) =>
          f.id === variables.fileId ? { ...f, content: variables.content } : f
        );
        return {
          ...old,
          data: old.data && old.data.files ? { ...old.data, files: updatedFiles } : updatedFiles,
        };
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all(roomId) });
      setUnsavedContents((prev) => {
        const copy = { ...prev };
        delete copy[variables.fileId];
        return copy;
      });
      setOpenFiles((prev) =>
        prev.map((f) => (f.id === variables.fileId ? { ...f, isDirty: false } : f))
      );
      toast.success("File saved");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save file");
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      newName,
    }: {
      fileId: string;
      newName: string;
    }) => {
      return filesApi.update(roomId, fileId, { name: newName });
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all(roomId) });
      const updatedFile: CodeFile = extractSingleFile(res);
      setOpenFiles((prev) =>
        prev.map((f) =>
          f.id === variables.fileId ? { ...f, name: updatedFile.name } : f
        )
      );
      toast.success("File renamed");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to rename file");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return filesApi.delete(roomId, fileId);
    },
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all(roomId) });
      // Remove from open tabs
      setOpenFiles((prev) => {
        const next = prev.filter((f) => f.id !== fileId);
        if (activeFileId === fileId) {
          setActiveFileId(next[0]?.id || null);
        }
        return next;
      });
      setUnsavedContents((prev) => {
        const copy = { ...prev };
        delete copy[fileId];
        return copy;
      });
      toast.success("File deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete file");
    },
  });

  // ── Code Execution Mutation ─────────────────────────────────
  const executeCodeMutation = useMutation({
    mutationFn: async () => {
      if (!activeFile) throw new Error("No active file to execute");
      setTerminalCollapsed(false);
      return compilerApi.execute(roomId, {
        language: activeFile.language,
        sourceCode: currentContent,
        fileId: activeFile.id,
      });
    },
    onSuccess: (res) => {
      if (res?.data?.data?.job?.id) {
        setCurrentJobId(res.data.data.job.id);
      }
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Code execution request failed"
      );
    },
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleSelectFile = React.useCallback(
    (fileId: string) => {
      setActiveFileId(fileId);
      const targetFile = files.find((f: CodeFile) => f.id === fileId);
      if (targetFile) {
        setOpenFiles((prev) => {
          if (prev.some((f) => f.id === fileId)) return prev;
          return [
            ...prev,
            {
              id: targetFile.id,
              name: targetFile.name,
              language: targetFile.language,
              isDirty: false,
            },
          ];
        });
      }
    },
    [files]
  );

  const handleCloseFile = React.useCallback(
    (fileId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenFiles((prev) => {
        const next = prev.filter((f) => f.id !== fileId);
        if (activeFileId === fileId) {
          setActiveFileId(next[0]?.id || null);
        }
        return next;
      });
    },
    [activeFileId]
  );

  const handleCreateFile = async (name: string, language: string) => {
    await createFileMutation.mutateAsync({ name, language });
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    await renameFileMutation.mutateAsync({ fileId, newName });
  };

  const handleDeleteFile = async (fileId: string) => {
    await deleteFileMutation.mutateAsync(fileId);
  };

  const handleCodeChange = (newVal: string) => {
    if (!activeFileId || !activeFile) return;
    const isDirty = newVal !== activeFile.content;

    setUnsavedContents((prev) => ({
      ...prev,
      [activeFileId]: newVal,
    }));

    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, isDirty } : f
      )
    );
  };

  const handleSaveFile = () => {
    if (!activeFileId || !canEdit) return;
    updateFileMutation.mutate({
      fileId: activeFileId,
      content: currentContent,
    });
  };

  const handleRunCode = () => {
    executeCodeMutation.mutate();
  };

  const handleLanguageChange = (newLang: string) => {
    if (!activeFileId || !canEdit) return;
    filesApi
      .update(roomId, activeFileId, { language: newLang })
      .then((res) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.files.all(roomId),
        });
        const updatedFile: CodeFile = extractSingleFile(res);
        setOpenFiles((prev) =>
          prev.map((f) =>
            f.id === activeFileId ? { ...f, language: updatedFile.language } : f
          )
        );
        toast.success(`Language changed to ${newLang}`);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to update file language"
        );
      });
  };

  const isSaving = updateFileMutation.isPending;
  const isRunning = executeCodeMutation.isPending;
  const activeTab = openFiles.find((f) => f.id === activeFileId);
  const isDirty = activeTab?.isDirty || false;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[hsl(var(--background))]">
      <Group orientation="horizontal" className="h-full w-full">
        {/* 1. Left Panel: File Explorer */}
        {!sidebarCollapsed && (
          <>
            <Panel
              defaultSize="18%"
              minSize="14%"
              maxSize="35%"
              className="h-full bg-[hsl(var(--card))]"
            >
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
                isLoading={isFilesLoading || isRoomLoading}
                canEdit={canEdit}
              />
            </Panel>
            <Separator className="w-1 bg-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--accent-9))] active:bg-[hsl(var(--accent-9))]" />
          </>
        )}

        {/* 2. Center Column: Editor Tabs + Monaco Editor + Terminal */}
        <Panel defaultSize="82%" minSize="40%" className="flex flex-col h-full">
          {/* Top Tabs Bar */}
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.6]">
            <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="size-9 shrink-0 rounded-none border-r border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </Button>

              <EditorTabs
                files={openFiles}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCloseFile={handleCloseFile}
                onNewFile={
                  canEdit
                    ? () => handleCreateFile("new-file.js", "javascript")
                    : undefined
                }
              />
            </div>
          </div>

          {/* Main Workspace Column */}
          {openFiles.length === 0 || !activeFile ? (
            /* Empty Editor State */
            <div className="flex flex-1 flex-col items-center justify-center bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] select-none">
              <div className="flex size-14 items-center justify-center rounded-full bg-[hsl(var(--gray-3))] mb-4">
                <FileCode2 className="size-7 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1">
                No active file selected
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xs text-center mb-6">
                Select an existing file from the sidebar on the left, or create
                a new file to start coding.
              </p>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={() => handleCreateFile("main.js", "javascript")}
                  className="gap-2 bg-[hsl(var(--accent-9))] text-white hover:bg-[hsl(var(--accent-10))]"
                >
                  <Plus className="size-4" />
                  <span>Create First File</span>
                </Button>
              )}
            </div>
          ) : (
            <Group orientation="vertical" className="flex-1 w-full overflow-hidden">
              {/* Editor Top Section */}
              <Panel defaultSize="72%" minSize="30%" className="flex flex-col">
                <EditorToolbar
                  language={activeFile.language}
                  onLanguageChange={handleLanguageChange}
                  onRunCode={handleRunCode}
                  onFormatCode={() => {
                    toast.info("Formatting triggered via Monaco Keybind (Alt+Shift+F)");
                  }}
                  onAiReview={() => {
                    toast.info("AI Code Review (Phase 6 feature coming soon)");
                  }}
                  isSaving={isSaving}
                  isSaved={!isDirty && !isSaving}
                  isDirty={isDirty}
                  isRunning={isRunning}
                  canEdit={canEdit}
                />
                <CodeEditor
                  roomId={roomId}
                  fileId={activeFile.id}
                  value={currentContent}
                  language={activeFile.language}
                  onChange={handleCodeChange}
                  onSave={handleSaveFile}
                  onRunCode={handleRunCode}
                  readOnly={!canEdit}
                />
              </Panel>

              {/* Separator Handle for Secondary Panel */}
              <Separator className="h-1 bg-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--primary))] active:bg-[hsl(var(--primary))]" />

              {/* Bottom Section: Workspace Secondary Panel (Terminal / Chat / Versions) */}
              <Panel
                defaultSize="30%"
                minSize="15%"
                maxSize="75%"
                collapsible
                onResize={(size: PanelSize) => {
                  setTerminalCollapsed(size.asPercentage < 5);
                }}
              >
                <div className="flex h-full w-full flex-col overflow-hidden bg-[hsl(var(--card))]">
                  {/* Workspace Secondary Tabs Bar */}
                  <div className="flex h-8 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] px-2 select-none">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={bottomTab === "terminal" ? "secondary" : "ghost"}
                        onClick={() => setBottomTab("terminal")}
                        className={cn(
                          "h-6 gap-1.5 px-2.5 text-xs font-medium transition-colors",
                          bottomTab === "terminal" && "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xs font-semibold"
                        )}
                      >
                        <TerminalIcon className="size-3.5 text-[hsl(var(--primary))]" />
                        <span>Terminal</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={bottomTab === "chat" ? "secondary" : "ghost"}
                        onClick={() => setBottomTab("chat")}
                        className={cn(
                          "h-6 gap-1.5 px-2.5 text-xs font-medium transition-colors",
                          bottomTab === "chat" && "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xs font-semibold"
                        )}
                      >
                        <MessageSquare className="size-3.5 text-blue-500" />
                        <span>Chat</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={bottomTab === "versions" ? "secondary" : "ghost"}
                        onClick={() => setBottomTab("versions")}
                        className={cn(
                          "h-6 gap-1.5 px-2.5 text-xs font-medium transition-colors",
                          bottomTab === "versions" && "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xs font-semibold"
                        )}
                      >
                        <History className="size-3.5 text-amber-500" />
                        <span>History</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] px-1">
                      <span>Collab Workspace v1</span>
                    </div>
                  </div>

                  {/* Tab Panel Content */}
                  <div className="flex-1 min-h-0 w-full overflow-hidden">
                    {bottomTab === "terminal" && (
                      <TerminalPanel
                        roomId={roomId}
                        onRunCode={handleRunCode}
                        isRunning={isRunning}
                        isCollapsed={terminalCollapsed}
                        onToggleCollapse={() =>
                          setTerminalCollapsed(!terminalCollapsed)
                        }
                        jobId={currentJobId}
                      />
                    )}
                    {bottomTab === "chat" && (
                      <ChatPanel
                        roomId={roomId}
                        currentUserId={user?.id}
                      />
                    )}
                    {bottomTab === "versions" && (
                      <VersionPanel
                        roomId={roomId}
                      />
                    )}
                  </div>
                </div>
              </Panel>
            </Group>
          )}
        </Panel>
      </Group>
    </div>
  );
}
