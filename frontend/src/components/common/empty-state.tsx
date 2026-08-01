"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Reusable empty state component with Linear/Vercel-inspired subtle glow icon,
 * clear typography, and optional CTA buttons.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.3]",
        compact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="relative mb-4 flex items-center justify-center">
          {/* Subtle background glow */}
          <div className="absolute inset-0 rounded-full bg-[hsl(var(--accent-9))/0.1] blur-md" />
          <div className="relative flex size-12 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] shadow-sm">
            {icon}
          </div>
        </div>
      )}

      <h3
        className={cn(
          "font-semibold tracking-tight text-[hsl(var(--foreground))]",
          compact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          "mt-1.5 max-w-sm text-sm text-[hsl(var(--muted-foreground))]",
          compact && "text-xs"
        )}
      >
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={compact ? "sm" : "default"}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size={compact ? "sm" : "default"}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
