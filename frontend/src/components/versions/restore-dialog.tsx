"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { versionsApi } from "@/services/api/versions";
import { QUERY_KEYS } from "@/lib/constants";
import type { Version } from "@/types";

interface RestoreDialogProps {
  roomId: string;
  version: Version | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * RestoreDialog — confirmation dialog before reverting a room to a snapshot.
 */
export function RestoreDialog({
  roomId,
  version,
  isOpen,
  onClose,
}: RestoreDialogProps) {
  const queryClient = useQueryClient();

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!version) throw new Error("No version selected");
      return versionsApi.restore(roomId, version.id);
    },
    onSuccess: () => {
      toast.success("Room restored successfully to snapshot");
      // Invalidate files and versions so the workspace reflects the restored code
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.files.all(roomId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.versions.all(roomId),
      });
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to restore room";
      toast.error(msg);
    },
  });

  if (!version) return null;

  const label = version.label || `Snapshot #${version.id.slice(0, 7)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <DialogTitle>Restore to Snapshot?</DialogTitle>
              <DialogDescription>
                Are you sure you want to revert all files in this room to{" "}
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {label}
                </span>
                ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
          <p>
            Any unsaved changes or new files created since this snapshot will be
            replaced with the snapshot contents. A new backup snapshot is
            recommended before restoring.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={restoreMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={restoreMutation.isPending}
            onClick={() => restoreMutation.mutate()}
            className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
          >
            {restoreMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            <span>Restore Room</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
