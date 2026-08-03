"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Sliders,
  ShieldAlert,
  GitBranch,
  Settings as SettingsIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  {
    name: "Profile",
    href: ROUTES.SETTINGS_PROFILE,
    icon: <User className="size-4" />,
  },
  {
    name: "Preferences",
    href: ROUTES.SETTINGS_PREFERENCES,
    icon: <Sliders className="size-4" />,
  },
  {
    name: "Integrations",
    href: ROUTES.SETTINGS_INTEGRATIONS,
    icon: <GitBranch className="size-4" />,
  },
  {
    name: "Account",
    href: ROUTES.SETTINGS_ACCOUNT,
    icon: <ShieldAlert className="size-4 text-[hsl(var(--destructive))]" />,
  },
] as const;

/**
 * Shared layout for User Settings pages (/(dashboard)/settings/*):
 * Renders PageHeader and Linear-style sidebar navigation tabs.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Settings"
        description="Manage your profile identity, editor theme preferences, and connected integrations."
      />

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Settings Navigation Sidebar */}
        <nav className="flex flex-row md:flex-col gap-1 md:w-64 shrink-0 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-[hsl(var(--border))] md:pr-4">
          {SETTINGS_TABS.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (pathname === ROUTES.SETTINGS &&
                tab.href === ROUTES.SETTINGS_PROFILE);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all shrink-0",
                  isActive
                    ? "bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] shadow-xs"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))/0.6] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active Settings Panel Content */}
        <div className="flex-1 max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
