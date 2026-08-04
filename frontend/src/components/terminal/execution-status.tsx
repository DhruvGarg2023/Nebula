"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types";

interface ExecutionStatusProps {
  status: JobStatus;
  executionTimeMs?: number | null;
  className?: string;
}

const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    iconClass: string;
  }
> = {
  queued: {
    label: "Queued",
    icon: Clock,
    badgeClass:
      "border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] text-[hsl(var(--muted-foreground))]",
    iconClass: "text-[hsl(var(--muted-foreground))]",
  },
  running: {
    label: "Running",
    icon: Loader2,
    badgeClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/20 dark:text-amber-400",
    iconClass: "animate-spin text-amber-500 dark:text-amber-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:border-emerald-400/20 dark:text-emerald-400",
    iconClass: "text-emerald-500 dark:text-emerald-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    badgeClass:
      "border-rose-500/20 bg-rose-500/10 text-rose-500 dark:border-rose-400/20 dark:text-rose-400",
    iconClass: "text-rose-500 dark:text-rose-400",
  },
  timeout: {
    label: "Timeout",
    icon: AlertTriangle,
    badgeClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/20 dark:text-amber-400",
    iconClass: "text-amber-500 dark:text-amber-400",
  },
};

/**
 * ExecutionStatus — badge displaying compiler job status & execution duration.
 */
export function ExecutionStatus({
  status,
  executionTimeMs,
  className,
}: ExecutionStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.queued;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.badgeClass,
        className
      )}
    >
      <Icon className={cn("size-3.5", config.iconClass)} />
      <span>{config.label}</span>
      {typeof executionTimeMs === "number" && (
        <span className="ml-0.5 text-[10px] opacity-75">
          ({executionTimeMs}ms)
        </span>
      )}
    </div>
  );
}
