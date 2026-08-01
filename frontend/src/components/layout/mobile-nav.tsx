"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderCode,
  GitBranch,
  Settings,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const mobileNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    name: "Rooms",
    href: ROUTES.ROOMS,
    icon: <FolderCode className="size-5" />,
  },
  {
    name: "GitHub",
    href: ROUTES.SETTINGS_INTEGRATIONS,
    icon: <GitBranch className="size-5" />,
  },
  {
    name: "Profile",
    href: ROUTES.SETTINGS_PROFILE,
    icon: <Settings className="size-5" />,
  },
];

/**
 * MobileNav bottom bar for screens < md breakpoint.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--card))/0.8] backdrop-blur-md px-2 md:hidden select-none">
      {mobileNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            {item.icon}
            <span>{item.name}</span>
            {isActive && (
              <span className="h-1 w-1 rounded-full bg-[hsl(var(--primary))]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
