"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

export interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Enterprise JoinRoomDialog modal to join a collaborative workspace
 * by pasting a Room ID or full invitation link.
 */
export function JoinRoomDialog({ open, onOpenChange }: JoinRoomDialogProps) {
  const router = useRouter();
  const [roomIdOrLink, setRoomIdOrLink] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdOrLink.trim()) {
      toast.error("Please enter a room ID or invitation URL");
      return;
    }

    setIsSubmitting(true);
    let target = roomIdOrLink.trim();

    // Check if user pasted an invite URL (/rooms/invites/[token])
    if (target.includes("/rooms/invites/")) {
      const parts = target.split("/rooms/invites/");
      const token = parts[1]?.split("?")[0]?.split("/")[0];
      if (token) {
        onOpenChange(false);
        setIsSubmitting(false);
        router.push(`/rooms/invites/${token}`);
        return;
      }
    }

    // Check if user pasted a direct room URL (/rooms/[id])
    if (target.includes("/rooms/")) {
      const parts = target.split("/rooms/");
      const id = parts[1]?.split("?")[0]?.split("/")[0];
      if (id) {
        target = id;
      }
    }

    toast.success("Joining workspace...");
    onOpenChange(false);
    setIsSubmitting(false);
    router.push(ROUTES.ROOM(target));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[hsl(var(--accent-9))] text-white shadow-sm">
              <KeyRound className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-[hsl(var(--foreground))]">
                Join Collaborative Room
              </DialogTitle>
              <DialogDescription className="text-xs text-[hsl(var(--muted-foreground))]">
                Enter an invitation code or paste a room link from your teammate.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleJoin} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="room-id-input" className="text-xs font-semibold">
              Room ID or Invitation Link
            </Label>
            <Input
              id="room-id-input"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={roomIdOrLink}
              onChange={(e) => setRoomIdOrLink(e.target.value)}
              disabled={isSubmitting}
              className="h-10 text-xs font-mono"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !roomIdOrLink.trim()}
              className="gap-1.5 shadow-sm"
            >
              <span>Join Workspace</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
