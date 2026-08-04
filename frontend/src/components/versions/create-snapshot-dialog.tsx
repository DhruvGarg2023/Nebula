"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GitCommit, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { versionsApi } from "@/services/api/versions";
import { QUERY_KEYS } from "@/lib/constants";

interface CreateSnapshotDialogProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CreateSnapshotDialog — modal form to record a new room snapshot.
 */
export function CreateSnapshotDialog({
  roomId,
  isOpen,
  onClose,
}: CreateSnapshotDialogProps) {
  const queryClient = useQueryClient();
  const [label, setLabel] = React.useState("");
  const [description, setDescription] = React.useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      versionsApi.createSnapshot(roomId, {
        label: label.trim() || undefined,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Snapshot created successfully");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.versions.all(roomId),
      });
      setLabel("");
      setDescription("");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create snapshot";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <GitCommit className="size-4" />
            </div>
            <div>
              <DialogTitle>Create Snapshot</DialogTitle>
              <DialogDescription>
                Freeze and record the current room state as a named version in history.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="snapshot-label">Snapshot Label</Label>
            <Input
              id="snapshot-label"
              placeholder="e.g. v1.0.0 - Basic algorithm working"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="snapshot-desc">Description (Optional)</Label>
            <Textarea
              id="snapshot-desc"
              placeholder="What changes or features does this snapshot include?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={createMutation.isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="gap-1.5 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
            >
              {createMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              <span>Create Snapshot</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
