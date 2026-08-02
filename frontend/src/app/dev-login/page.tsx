"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Terminal, ArrowRight, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/services/api/auth";
import { devLoginSchema } from "@/lib/validators";
import { ROUTES } from "@/lib/constants";
import type { DevLoginCredentials } from "@/types";

/**
 * Developer Login Page (/dev-login).
 * Allows instant session generation for local testing without GitHub OAuth.
 */
export default function DevLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DevLoginCredentials>({
    resolver: zodResolver(devLoginSchema),
    defaultValues: {
      email: "dhruv@codesync.dev",
      name: "Dhruv Garg",
    },
  });

  const onSubmit = async (data: DevLoginCredentials) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.devLogin(data);
      const { accessToken } = response.data.data;

      await login(accessToken);
      toast.success(`Welcome to CodeSync Dev Mode, ${data.name}!`);

      router.replace(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Dev login failed. Please ensure backend is running on port 5000.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (name: string, email: string) => {
    setValue("name", name);
    setValue("email", email);
    toast.info(`Loaded preset: ${name}`);
  };

  return (
    <AuthCard
      title="Developer Testing Login"
      description="Instant session generation for local testing without requiring GitHub OAuth."
      showBackToLogin
      footer={
        <div className="flex items-center justify-center gap-1.5 text-xs text-[hsl(var(--accent-11))]">
          <Terminal className="size-3.5 text-[hsl(var(--accent-9))]" />
          <span>Non-production sandbox authentication</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="developer@codesync.dev"
            disabled={isSubmitting}
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-[hsl(var(--error))]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Display Name Field */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Doe"
            disabled={isSubmitting}
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-[hsl(var(--error))]">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-sm font-semibold gap-2 mt-2"
        >
          <UserCheck className="size-4" />
          <span>{isSubmitting ? "Generating Dev Session..." : "Sign In to Workspace"}</span>
          <ArrowRight className="ml-auto size-4" />
        </Button>
      </form>

      {/* ── Quick Test Personas ────────────────────────────── */}
      <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <Sparkles className="size-3.5 text-[hsl(var(--accent-9))]" />
          <span>Quick Switch Test Persona</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickPreset("Dhruv Garg", "dhruv@codesync.dev")}
            className="flex flex-col items-start rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] p-2 text-left text-xs transition-colors hover:border-[hsl(var(--gray-8))] hover:bg-[hsl(var(--card))]"
          >
            <span className="font-semibold text-[hsl(var(--foreground))]">
              Dhruv Garg
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate w-full">
              dhruv@codesync.dev
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset("Alice Engineer", "alice@codesync.dev")}
            className="flex flex-col items-start rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] p-2 text-left text-xs transition-colors hover:border-[hsl(var(--gray-8))] hover:bg-[hsl(var(--card))]"
          >
            <span className="font-semibold text-[hsl(var(--foreground))]">
              Alice Engineer
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate w-full">
              alice@codesync.dev
            </span>
          </button>
        </div>
      </div>
    </AuthCard>
  );
}
