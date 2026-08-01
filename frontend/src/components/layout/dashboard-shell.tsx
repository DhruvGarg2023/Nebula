"use client";

import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { Sheet } from "@/components/ui/sheet";
import { STORAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  onCreateRoom?: () => void;
}

/**
 * Main dashboard application wrapper.
 * Houses sidebar, topbar, mobile nav, global command palette (⌘K),
 * and handles responsive layout spacing.
 */
export function DashboardShell({
  children,
  className,
  onCreateRoom,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

  // Restore collapsed state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // ── Global ⌘K / Ctrl+K Listener ─────────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Desktop Sidebar (hidden on screens < md) */}
      <div className="hidden md:block h-full shrink-0">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Sidebar inside Sheet */}
      <Sheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        side="left"
        className="w-[240px] p-0"
      >
        <AppSidebar
          collapsed={false}
          onToggleCollapse={() => setMobileMenuOpen(false)}
          className="w-full border-r-0"
        />
      </Sheet>

      {/* Main Container (Topbar + Content Area) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileNav={() => setMobileMenuOpen(true)}
        />

        {/* Scrollable Content Area */}
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8",
            className
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCreateRoom={onCreateRoom}
      />
    </div>
  );
}
