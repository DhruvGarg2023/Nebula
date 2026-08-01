"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderCode,
  Settings,
  GitBranch,
  Code2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    name: "Rooms",
    href: ROUTES.ROOMS,
    icon: <FolderCode className="size-4" />,
  },
  {
    name: "GitHub Sync",
    href: ROUTES.SETTINGS_INTEGRATIONS,
    icon: <GitBranch className="size-4" />,
  },
  {
    name: "Settings",
    href: ROUTES.SETTINGS_PROFILE,
    icon: <Settings className="size-4" />,
  },
];

/**
 * AppSidebar component inspired by Linear & Vercel.
 * Features collapsible sidebar, glowing active indicator, logo, and user mini card.
 */
export function AppSidebar({
  collapsed,
  onToggleCollapse,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-[width] duration-200 ease-in-out select-none",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
        className
      )}
    >
      {/* ── Logo & Version Badge ────────────────────────────── */}
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-3.5">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2.5 overflow-hidden focus:outline-none"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
            <Code2 className="size-4" />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold tracking-tight text-[hsl(var(--foreground))] text-sm">
                CodeSync
              </span>
              <span className="inline-flex items-center rounded bg-[hsl(var(--accent-3))] px-1.5 py-0.2 text-[10px] font-mono font-medium text-[hsl(var(--accent-11))]">
                PRO
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Main Navigation ─────────────────────────────────── */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          const buttonContent = (
            <Link
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                isActive
                  ? "text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))/0.5] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
                  transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10 shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="relative z-10 flex-1 truncate">
                  {item.name}
                </span>
              )}
              {!collapsed && item.badge && (
                <span className="relative z-10 ml-auto inline-flex items-center rounded-full bg-[hsl(var(--accent-9))/0.2] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--accent-9))]">
                  {item.badge}
                </span>
              )}
            </Link>
          );

          return collapsed ? (
            <Tooltip
              key={item.href}
              content={item.name}
              position="right"
              delay={100}
            >
              {buttonContent}
            </Tooltip>
          ) : (
            <React.Fragment key={item.href}>{buttonContent}</React.Fragment>
          );
        })}

        {/* AI Code Review Quick Access */}
        <div className="pt-4">
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--gray-9))]">
              AI Assistant
            </div>
          )}
          <Tooltip
            content="AI Features (Powered by Gemini)"
            position="right"
            delay={100}
          >
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[hsl(var(--accent-11))] bg-[hsl(var(--accent-3))/0.6] border border-[hsl(var(--accent-6))] transition-colors cursor-default",
                collapsed && "justify-center px-0"
              )}
            >
              <Sparkles className="size-4 shrink-0 text-[hsl(var(--accent-9))]" />
              {!collapsed && <span>Real-time AI Code Review</span>}
            </div>
          </Tooltip>
        </div>
      </nav>

      {/* ── User Footer & Collapse Toggle ───────────────────── */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-2.5">
        <div className="flex items-center justify-between gap-2">
          {user ? (
            <div
              className={cn(
                "flex items-center gap-2.5 overflow-hidden rounded-lg p-1.5 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                size="sm"
              />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="truncate text-xs font-semibold text-[hsl(var(--foreground))]">
                    {user.name}
                  </span>
                  <span className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Collapse button */}
          <Tooltip
            content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            position="right"
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex size-7 shrink-0 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
