"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Search,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
  LogOut,
  Code2,
  CheckCheck,
  Menu,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { notificationsApi } from "@/services/api/notifications";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { TimeAgo } from "@/components/common/time-ago";
import { cn } from "@/lib/utils";

interface AppTopbarProps {
  onOpenCommandPalette: () => void;
  onOpenMobileNav?: () => void;
  className?: string;
}

/**
 * AppTopbar component with breadcrumbs, command palette trigger (⌘K),
 * notification bell with Popover dropdown, theme toggle, and user menu.
 */
export function AppTopbar({
  onOpenCommandPalette,
  onOpenMobileNav,
  className,
}: AppTopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [showNotifications, setShowNotifications] = React.useState(false);

  // ── Query unread notification count ─────────────────────────
  const { data: unreadCountData } = useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: async () => {
      try {
        const res = await notificationsApi.getUnreadCount();
        return res?.data?.data?.count ?? 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30_000,
  });

  const unreadCount = unreadCountData ?? 0;

  // ── Query notification list when popover is open ────────────
  const { data: notificationsData } = useQuery({
    queryKey: QUERY_KEYS.notifications.list({ limit: 8 }),
    queryFn: async () => {
      try {
        const res = await notificationsApi.list({ limit: 8 });
        return res?.data?.data ?? [];
      } catch {
        return [];
      }
    },
    enabled: showNotifications,
  });

  // ── Mark all read mutation ──────────────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications.unreadCount,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications.all,
      });
    },
  });

  // ── Breadcrumb section text ─────────────────────────────────
  const sectionTitle = React.useMemo(() => {
    if (pathname === ROUTES.DASHBOARD) return "Dashboard";
    if (pathname.startsWith(ROUTES.ROOMS)) return "Rooms & Collaboration";
    if (pathname.startsWith(ROUTES.SETTINGS_INTEGRATIONS))
      return "GitHub Integrations";
    if (pathname.startsWith(ROUTES.SETTINGS_PROFILE)) return "Profile Settings";
    return "CodeSync";
  }, [pathname]);

  return (
    <header
      className={cn(
        "flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))/0.6] backdrop-blur-md px-4 sm:px-6 z-30 select-none",
        className
      )}
    >
      {/* ── Left: Mobile Hamburger & Section Title ──────────── */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="flex md:hidden size-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            aria-label="Open mobile menu"
          >
            <Menu className="size-4" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {sectionTitle}
          </span>
        </div>
      </div>

      {/* ── Center: ⌘K Command Palette Trigger ──────────────── */}
      <div className="hidden sm:flex flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex h-8 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] px-3 text-xs text-[hsl(var(--muted-foreground))] shadow-xs transition-colors hover:border-[hsl(var(--gray-8))] hover:text-[hsl(var(--foreground))]"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5" />
            <span>Search rooms, files, or jump to command...</span>
          </div>
          <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* ── Right Controls ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex sm:hidden size-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          aria-label="Search"
        >
          <Search className="size-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative inline-block text-left">
          <Tooltip content="Notifications">
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative flex size-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[hsl(var(--accent-9))] text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-4 text-[hsl(var(--popover-foreground))] shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[hsl(var(--accent-9))/0.2] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--accent-9))]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllReadMutation.mutate()}
                    className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
                  >
                    <CheckCheck className="size-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {!notificationsData || !Array.isArray(notificationsData) || notificationsData.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    No recent notifications
                  </div>
                ) : (
                  notificationsData.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border border-[hsl(var(--border))] p-3 text-xs transition-colors",
                        !notif.isRead
                          ? "bg-[hsl(var(--accent-3))/0.4] border-[hsl(var(--accent-6))]"
                          : "bg-[hsl(var(--card))]"
                      )}
                    >
                      <div className="flex items-center justify-between font-medium text-[hsl(var(--foreground))]">
                        <span>{notif.title}</span>
                        <TimeAgo date={notif.createdAt} />
                      </div>
                      <p className="text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Button */}
        <Tooltip
          content={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
        >
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </Tooltip>

        {/* User Profile Dropdown Menu */}
        {user ? (
          <DropdownMenu
            trigger={
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size="sm"
                />
              </div>
            }
          >
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
                {user.name}
              </p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem
              icon={<UserIcon />}
              onClick={() => (window.location.href = ROUTES.SETTINGS_PROFILE)}
            >
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<Settings />}
              onClick={() => (window.location.href = ROUTES.SETTINGS_INTEGRATIONS)}
            >
              GitHub Sync
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              icon={<LogOut />}
              destructive
              onClick={() => logout()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenu>
        ) : (
          <Link href={ROUTES.LOGIN}>
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
