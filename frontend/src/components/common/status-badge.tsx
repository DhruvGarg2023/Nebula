"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "online"
  | "offline"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "timeout"
  | "viewer"
  | "editor"
  | "admin"
  | "pending"
  | "accepted"
  | "expired"
  | "revoked";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<
  string,
  {
    variant: "default" | "success" | "warning" | "error" | "info" | "accent";
    dotColor: string;
    label: string;
  }
> = {
  online: { variant: "success", dotColor: "bg-emerald-500", label: "Online" },
  offline: { variant: "default", dotColor: "bg-gray-400", label: "Offline" },
  completed: { variant: "success", dotColor: "bg-emerald-500", label: "Completed" },
  running: { variant: "info", dotColor: "bg-blue-500 animate-pulse", label: "Running" },
  queued: { variant: "warning", dotColor: "bg-amber-500", label: "Queued" },
  failed: { variant: "error", dotColor: "bg-red-500", label: "Failed" },
  timeout: { variant: "error", dotColor: "bg-red-500", label: "Timeout" },
  viewer: { variant: "default", dotColor: "bg-gray-400", label: "Viewer" },
  editor: { variant: "accent", dotColor: "bg-indigo-500", label: "Editor" },
  admin: { variant: "info", dotColor: "bg-blue-500", label: "Admin" },
  pending: { variant: "warning", dotColor: "bg-amber-500", label: "Pending" },
  accepted: { variant: "success", dotColor: "bg-emerald-500", label: "Accepted" },
  expired: { variant: "default", dotColor: "bg-gray-400", label: "Expired" },
  revoked: { variant: "error", dotColor: "bg-red-500", label: "Revoked" },
};

/**
 * StatusBadge component with status dot and automatic color mapping.
 */
export function StatusBadge({
  status,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const config = statusConfig[normalized] || {
    variant: "default" as const,
    dotColor: "bg-gray-400",
    label: label || status,
  };

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5 font-medium capitalize", className)}
    >
      {showDot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", config.dotColor)}
        />
      )}
      <span>{label || config.label}</span>
    </Badge>
  );
}
