"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBackToLogin?: boolean;
  className?: string;
}

/**
 * Reusable AuthCard wrapper inspired by Clerk, Vercel & Linear.
 * Features glowing logo icon, subtle border glow, and crisp typography.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
  showBackToLogin = false,
  className,
}: AuthCardProps) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-4 py-12 select-none">
      {/* ── Background Ambient Glow ─────────────────────────── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[radial-gradient(circle,hsl(var(--accent-9)/0.15)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12)_0%,transparent_70%)] blur-3xl" />

      {/* ── Brand Header ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8 flex flex-col items-center text-center"
      >
        <Link
          href={ROUTES.HOME}
          className="group relative flex items-center gap-3 focus:outline-none"
        >
          {/* Animated glow around logo */}
          <div className="absolute inset-0 rounded-xl bg-[hsl(var(--accent-9))/0.3] blur-md transition-all duration-300 group-hover:bg-[hsl(var(--accent-9))/0.5]" />
          <div className="relative flex size-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm">
            <Code2 className="size-6 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
            CodeSync
          </span>
        </Link>
      </motion.div>

      {/* ── Main Auth Card Body ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.8] backdrop-blur-xl p-8 shadow-2xl transition-all",
          className
        )}
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        </div>

        {/* Children Form / Actions */}
        <div className="space-y-6">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="mt-6 border-t border-[hsl(var(--border))] pt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
            {footer}
          </div>
        )}

        {/* Back to Login link */}
        {showBackToLogin && (
          <div className="mt-6 text-center">
            <Link
              href={ROUTES.LOGIN}
              className="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:underline transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Bottom Terms & Copyright ───────────────────────── */}
      <p className="mt-8 text-center text-xs text-[hsl(var(--gray-9))]">
        © {new Date().getFullYear()} CodeSync. All rights reserved.
      </p>
    </div>
  );
}
