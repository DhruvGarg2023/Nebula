"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User as UserIcon, Mail, Sparkles, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { usersApi } from "@/services/api/users";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  avatarUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Profile Settings Page (/(dashboard)/settings/profile)
 * Allows updating user display name, bio, and avatar URL via PATCH /api/v1/users/me.
 */
export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  // Sync form defaults when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await usersApi.updateMe({
        name: values.name.trim(),
        bio: values.bio?.trim() || undefined,
        avatarUrl: values.avatarUrl?.trim() || undefined,
      });

      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save profile changes"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
      {/* ── Avatar Header Summary ──────────────────────────── */}
      <div className="flex items-center gap-4 border-b border-[hsl(var(--border))] pb-6">
        <Avatar
          src={form.watch("avatarUrl") || user?.avatarUrl}
          name={user?.name || "CS"}
          size="lg"
          className="size-16 rounded-2xl ring-2 ring-[hsl(var(--border))]"
        />
        <div>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            {user?.name || "Your Profile"}
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mt-0.5">
            <Mail className="size-3.5" />
            <span>{user?.email || "No email linked"}</span>
          </p>
        </div>
      </div>

      {/* ── Profile Update Form ────────────────────────────── */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name" className="text-xs font-semibold">
            Display Name
          </Label>
          <Input
            id="profile-name"
            placeholder="Your full name"
            disabled={isSubmitting}
            className="h-10 text-xs"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-[11px] text-[hsl(var(--destructive))]">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email" className="text-xs font-semibold">
            Email Address
          </Label>
          <Input
            id="profile-email"
            value={user?.email || ""}
            disabled
            className="h-10 text-xs bg-[hsl(var(--muted))/0.5] font-mono"
          />
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Your email is verified via SSO and cannot be modified directly.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-avatar" className="text-xs font-semibold">
            Avatar URL (optional)
          </Label>
          <Input
            id="profile-avatar"
            placeholder="https://..."
            disabled={isSubmitting}
            className="h-10 text-xs font-mono"
            {...form.register("avatarUrl")}
          />
          {form.formState.errors.avatarUrl && (
            <p className="text-[11px] text-[hsl(var(--destructive))]">
              {form.formState.errors.avatarUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-bio" className="text-xs font-semibold">
            Bio / Headline
          </Label>
          <Textarea
            id="profile-bio"
            placeholder="Full-stack developer working on distributed systems..."
            disabled={isSubmitting}
            rows={3}
            className="text-xs resize-none"
            {...form.register("bio")}
          />
          {form.formState.errors.bio && (
            <p className="text-[11px] text-[hsl(var(--destructive))]">
              {form.formState.errors.bio.message}
            </p>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 shadow-sm"
          >
            <Sparkles className="size-3.5" />
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
