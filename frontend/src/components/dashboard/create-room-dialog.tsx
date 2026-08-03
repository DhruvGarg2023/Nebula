"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Code2,
  Lock,
  Globe,
  Sparkles,
  Terminal,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { roomsApi } from "@/services/api/rooms";
import { ROUTES } from "@/lib/constants";

const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(50, "Room name cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9-_ ]+$/, "Only alphanumeric characters, spaces, dashes, and underscores allowed"),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
  language: z.enum([
    "javascript",
    "typescript",
    "python",
    "go",
    "rust",
    "cpp",
    "java",
    "html",
  ]),
  isPublic: z.boolean(),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

const LANGUAGES = [
  { value: "javascript", label: "JavaScript (Node.js)", badge: "JS" },
  { value: "typescript", label: "TypeScript", badge: "TS" },
  { value: "python", label: "Python 3", badge: "PY" },
  { value: "go", label: "Go 1.21", badge: "GO" },
  { value: "rust", label: "Rust (Cargo)", badge: "RS" },
  { value: "cpp", label: "C++ (GCC)", badge: "C++" },
  { value: "java", label: "Java 21", badge: "JV" },
  { value: "html", label: "HTML5 / Web", badge: "HTML" },
] as const;

export interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Enterprise CreateRoomDialog modal for creating collaborative IDE rooms.
 * Validates with Zod, invokes POST /api/v1/rooms, and redirects to the workspace.
 */
export function CreateRoomDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRoomDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "typescript",
      isPublic: false,
    },
  });

  const onSubmit = async (values: CreateRoomFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await roomsApi.create({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        language: values.language,
        isPublic: values.isPublic,
      });

      const newRoom = res.data?.data;
      toast.success("Collaborative room created!");
      form.reset();
      onOpenChange(false);
      onSuccess?.();

      if (newRoom?.id) {
        router.push(ROUTES.ROOM(newRoom.id));
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create room workspace"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
              <Code2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-[hsl(var(--foreground))]">
                Create Collaborative Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-[hsl(var(--muted-foreground))]">
                Spin up a real-time CRDT room with multi-language Docker execution.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Room Name */}
          <div className="space-y-1.5">
            <Label htmlFor="room-name" className="text-xs font-semibold">
              Room Name <span className="text-[hsl(var(--destructive))]">*</span>
            </Label>
            <Input
              id="room-name"
              placeholder="e.g. distributed-kv-store or rust-concurrency"
              disabled={isSubmitting}
              className="h-10 text-xs font-mono"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-[11px] text-[hsl(var(--destructive))]">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="room-desc" className="text-xs font-semibold">
              Description{" "}
              <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
                (optional)
              </span>
            </Label>
            <Textarea
              id="room-desc"
              placeholder="Brief summary of what your team is building in this room..."
              disabled={isSubmitting}
              rows={2}
              className="text-xs resize-none"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-[11px] text-[hsl(var(--destructive))]">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Environment Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Primary Environment</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {LANGUAGES.map((lang) => {
                const isSelected = form.watch("language") === lang.value;
                return (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() =>
                      form.setValue("language", lang.value, {
                        shouldValidate: true,
                      })
                    }
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-all ${
                      isSelected
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))] font-medium shadow-xs"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.4] text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-hover))]"
                    }`}
                  >
                    <span className="flex size-6 items-center justify-center rounded bg-[hsl(var(--gray-3))] text-[10px] font-mono font-bold">
                      {lang.badge}
                    </span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public / Private Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.3] p-3">
            <div className="flex items-center gap-2.5">
              {form.watch("isPublic") ? (
                <Globe className="size-4 text-[hsl(var(--success))]" />
              ) : (
                <Lock className="size-4 text-[hsl(var(--muted-foreground))]" />
              )}
              <div>
                <Label
                  htmlFor="is-public"
                  className="text-xs font-semibold cursor-pointer"
                >
                  {form.watch("isPublic") ? "Public Room" : "Private Room"}
                </Label>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {form.watch("isPublic")
                    ? "Anyone with the link can join and view code"
                    : "Only invited members can access this workspace"}
                </p>
              </div>
            </div>
            <Switch
              id="is-public"
              checked={form.watch("isPublic")}
              onCheckedChange={(val) =>
                form.setValue("isPublic", val, { shouldValidate: true })
              }
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 shadow-sm"
            >
              <Sparkles className="size-3.5" />
              <span>{isSubmitting ? "Creating..." : "Create Room"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
