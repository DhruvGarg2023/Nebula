"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderCode,
  Settings,
  GitBranch,
  Plus,
  Sun,
  Moon,
  LogOut,
  Search,
  Code2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { roomsApi } from "@/services/api/rooms";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Room } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom?: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: "Navigation" | "Actions" | "Preferences" | "Workspaces";
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

/**
 * Global Command Palette (⌘K) inspired by Linear & Raycast.
 */
export function CommandPalette({
  open,
  onOpenChange,
  onCreateRoom,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Fetch recent rooms for quick navigation inside ⌘K
  const { data: roomsResponse } = useQuery({
    queryKey: ["rooms", "command-palette"],
    queryFn: () => roomsApi.list({ limit: 8, page: 1 }),
    enabled: open,
    staleTime: 30 * 1000,
  });

  const rooms: Room[] = roomsResponse?.data?.data || [];

  const items: CommandItem[] = React.useMemo(() => {
    const baseItems: CommandItem[] = [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        category: "Navigation",
        icon: <LayoutDashboard className="size-4" />,
        shortcut: "G D",
        onSelect: () => {
          router.push(ROUTES.DASHBOARD);
          onOpenChange(false);
        },
      },
      {
        id: "nav-rooms",
        label: "Go to Rooms",
        category: "Navigation",
        icon: <FolderCode className="size-4" />,
        shortcut: "G R",
        onSelect: () => {
          router.push(ROUTES.ROOMS);
          onOpenChange(false);
        },
      },
      {
        id: "nav-integrations",
        label: "Go to GitHub Integrations",
        category: "Navigation",
        icon: <GitBranch className="size-4" />,
        shortcut: "G I",
        onSelect: () => {
          router.push(ROUTES.SETTINGS_INTEGRATIONS);
          onOpenChange(false);
        },
      },
      {
        id: "nav-profile",
        label: "Go to Profile Settings",
        category: "Navigation",
        icon: <Settings className="size-4" />,
        shortcut: "G S",
        onSelect: () => {
          router.push(ROUTES.SETTINGS_PROFILE);
          onOpenChange(false);
        },
      },
      {
        id: "action-new-room",
        label: "Create New Room",
        category: "Actions",
        icon: <Plus className="size-4" />,
        shortcut: "C R",
        onSelect: () => {
          onOpenChange(false);
          onCreateRoom?.();
        },
      },
      {
        id: "pref-theme",
        label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`,
        category: "Preferences",
        icon: theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />,
        shortcut: "T M",
        onSelect: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          onOpenChange(false);
        },
      },
      {
        id: "action-logout",
        label: "Log out of CodeSync",
        category: "Actions",
        icon: <LogOut className="size-4 text-[hsl(var(--error))]" />,
        onSelect: () => {
          onOpenChange(false);
          logout();
        },
      },
    ];

    const workspaceItems: CommandItem[] = rooms.map((room) => ({
      id: `room-${room.id}`,
      label: `Open workspace: ${room.name}`,
      category: "Workspaces",
      icon: <Code2 className="size-4 text-[hsl(var(--primary))]" />,
      onSelect: () => {
        router.push(ROUTES.ROOM(room.id));
        onOpenChange(false);
      },
    }));

    return [...baseItems, ...workspaceItems];
  }, [router, onOpenChange, onCreateRoom, theme, setTheme, logout, rooms]);

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((it) => it.label.toLowerCase().includes(lower));
  }, [items, query]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(filteredItems.length - 1, 0) : prev - 1
        );
      } else if (e.key === "Enter" && filteredItems.length > 0) {
        e.preventDefault();
        filteredItems[selectedIndex]?.onSelect();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, selectedIndex]);

  // Categories
  const categories = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filteredItems.forEach((it) => {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category)!.push(it);
    });
    return Array.from(map.entries());
  }, [filteredItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
        <Search className="size-4 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search..."
          className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--gray-10))] focus:outline-none"
          autoFocus
        />
        <kbd className="inline-flex h-5 select-none items-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-1.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
          ESC
        </kbd>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-2">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Code2 className="size-8 text-[hsl(var(--gray-8))] mb-2" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No matching commands found
            </p>
          </div>
        ) : (
          categories.map(([category, catItems]) => (
            <div key={category} className="mb-3 last:mb-0">
              <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                {category}
              </div>
              <div className="mt-1 space-y-0.5">
                {catItems.map((item) => {
                  const idx = filteredItems.findIndex((x) => x.id === item.id);
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.onSelect()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="flex-1 truncate font-medium">
                        {item.label}
                      </span>
                      {item.shortcut && (
                        <kbd className="ml-auto inline-flex h-5 items-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span>Use ↑↓ to navigate</span>
        <span>Enter to select</span>
      </div>
    </Dialog>
  );
}
