"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default" | "warning";
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

/**
 * Reusable confirmation dialog for dangerous or irreversible actions.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive";
  const isWarning = variant === "warning";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          {isDestructive ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--error-bg))] text-[hsl(var(--error))]">
              <AlertTriangle className="size-5" />
            </div>
          ) : isWarning ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))]">
              <AlertTriangle className="size-5" />
            </div>
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--info-bg))] text-[hsl(var(--info))]">
              <Info className="size-5" />
            </div>
          )}
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-1">
              {description}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={isDestructive ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
