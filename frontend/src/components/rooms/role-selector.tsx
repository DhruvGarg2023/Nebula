"use client";

import * as React from "react";
import { Shield, Edit3, Eye, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface RoleSelectorProps {
  role: Role | "viewer" | "editor" | "admin";
  onRoleChange: (newRole: "viewer" | "editor" | "admin") => void;
  disabled?: boolean;
  className?: string;
}

const ROLES: {
  value: "viewer" | "editor" | "admin";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}[] = [
  {
    value: "viewer",
    label: "Viewer",
    description: "Can view code and chat, cannot edit files",
    icon: Eye,
    colorClass: "text-blue-500",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Can edit code files, run terminal, and chat",
    icon: Edit3,
    colorClass: "text-emerald-500",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full access including member and room settings",
    icon: Shield,
    colorClass: "text-amber-500",
  },
];

/**
 * RoleSelector — compact dropdown for Viewer / Editor / Admin permissions.
 */
export function RoleSelector({
  role,
  onRoleChange,
  disabled = false,
  className,
}: RoleSelectorProps) {
  const currentRole =
    ROLES.find((r) => r.value === (role || "").toLowerCase()) || ROLES[0];
  const Icon = currentRole.icon;

  return (
    <DropdownMenu
      align="right"
      trigger={
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-7 gap-1.5 px-2.5 text-xs font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))]",
            className
          )}
        >
          <Icon className={cn("size-3.5", currentRole.colorClass)} />
          <span>{currentRole.label}</span>
        </Button>
      }
    >
      {ROLES.map((r) => {
        const RIcon = r.icon;
        const isSelected = r.value === currentRole.value;
        return (
          <DropdownMenuItem
            key={r.value}
            onClick={() => onRoleChange(r.value)}
            className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium text-xs">
                <RIcon className={cn("size-3.5", r.colorClass)} />
                <span>{r.label}</span>
              </div>
              {isSelected && (
                <Check className="size-3.5 text-[hsl(var(--primary))]" />
              )}
            </div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {r.description}
            </span>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenu>
  );
}
