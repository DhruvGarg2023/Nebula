"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  Terminal,
  Sparkles,
  Zap,
  ArrowRight,
  Users,
  ShieldCheck,
  Cpu,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/common/google-icon";
import { ROUTES } from "@/lib/constants";

/**
 * CodeSync Enterprise SaaS Landing Page (/ - root).
 * Implements Section 5.1 of frontend_architecture_plan.md.
 * Always displays the landing page content so users can view the homepage or manage their session.
 */
export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))] select-none">
      {/* ── Background Ambient Gradients ─────────────────────── */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[800px] rounded-full bg-[radial-gradient(circle,hsl(var(--accent-9)/0.15)_0%,transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute top-[500px] left-1/4 size-[600px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12)_0%,transparent_70%)] blur-3xl" />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="relative z-20 flex h-16 items-center justify-between border-b border-[hsl(var(--border))/0.6] bg-[hsl(var(--background))/0.8] backdrop-blur-md px-6 sm:px-12">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
            <Code2 className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">CodeSync</span>
          <span className="rounded bg-[hsl(var(--accent-3))] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[hsl(var(--accent-11))]">
            ENTERPRISE
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline-block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                Signed in as{" "}
                <span className="text-[hsl(var(--foreground))] font-semibold">
                  {user?.name || "Developer"}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="gap-1.5 text-xs h-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
              <Link href={ROUTES.DASHBOARD}>
                <Button size="sm" className="gap-2 shadow-sm text-xs">
                  <LayoutDashboard className="size-3.5" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={ROUTES.DEV_LOGIN}>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-xs">
                  <Terminal className="size-3.5 text-[hsl(var(--accent-9))]" />
                  <span>Dev Login</span>
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button size="sm" className="gap-2 shadow-sm text-xs">
                  <span>Sign In</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.8] px-3.5 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] backdrop-blur-sm mb-6 shadow-xs"
        >
          <Sparkles className="size-3.5 text-[hsl(var(--accent-9))]" />
          <span>Real-time CRDTs + Sandboxed Docker Compiler + AI Review</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
        >
          Collaborate & Execute{" "}
          <span className="bg-gradient-to-r from-[hsl(var(--accent-9))] via-[hsl(var(--accent-11))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
            at Light Speed.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg"
        >
          An enterprise-grade collaborative code editor powered by Yjs CRDTs,
          multi-language Docker execution, and real-time AI code review.
          Engineered for team performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          {isAuthenticated ? (
            <Link href={ROUTES.DASHBOARD}>
              <Button
                size="lg"
                className="h-12 px-6 text-sm font-semibold shadow-lg gap-3 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              >
                <LayoutDashboard className="size-5 text-[hsl(var(--primary))]" />
                <span>Go to Workspace Dashboard</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button
                size="lg"
                className="h-12 px-6 text-sm font-semibold shadow-lg gap-3 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              >
                <GoogleIcon className="size-5" />
                <span>Continue with Google</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}

          <Link href={ROUTES.DEV_LOGIN}>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-sm font-medium gap-2 border-[hsl(var(--border))]"
            >
              <Terminal className="size-4 text-[hsl(var(--accent-9))]" />
              <span>Developer Sandbox</span>
            </Button>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs text-[hsl(var(--muted-foreground))]"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[hsl(var(--success))]" />
            <span>Google OAuth 2.0 Enterprise SSO</span>
          </span>
          <span className="flex items-center gap-2">
            <Zap className="size-4 text-[hsl(var(--warning))]" />
            <span>&lt;10ms CRDT Sync</span>
          </span>
          <span className="flex items-center gap-2">
            <Cpu className="size-4 text-[hsl(var(--info))]" />
            <span>Sandboxed Execution</span>
          </span>
        </motion.div>
      </section>

      {/* ── Feature Grid ───────────────────────────────────── */}
      <section className="relative z-10 border-t border-[hsl(var(--border))/0.6] bg-[hsl(var(--gray-1))/0.5] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-[hsl(var(--accent-9))]">
              ARCHITECTURE
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Engineered with modern SaaS standards
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--accent-3))] text-[hsl(var(--accent-11))] mb-4">
                <Zap className="size-5" />
              </div>
              <h3 className="text-base font-semibold">Sub-Millisecond CRDTs</h3>
              <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                Real-time cursor tracking and conflict-free replicated data types
                powered by Yjs and custom WebSocket namespaces.
              </p>
            </div>

            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--info))/0.15] text-[hsl(var(--info))] mb-4">
                <Terminal className="size-5" />
              </div>
              <h3 className="text-base font-semibold">Multi-Language Docker Run</h3>
              <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                Execute JavaScript, TypeScript, Python, Go, Rust, C++, and Java in
                secure, ephemeral container sandboxes.
              </p>
            </div>

            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))/0.15] text-[hsl(var(--warning))] mb-4">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-base font-semibold">Gemini 2.5 AI Code Review</h3>
              <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                Integrated LLM assistant that reviews active room code for bugs,
                security vulnerabilities, and optimization tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[hsl(var(--border))/0.6] bg-[hsl(var(--background))] py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-[hsl(var(--primary))]" />
            <span className="font-semibold text-[hsl(var(--foreground))]">CodeSync</span>
            <span>— Enterprise Collaborative IDE</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-[hsl(var(--success))]" />
              <span>Google OAuth 2.0 Enterprise SSO</span>
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="size-3.5 text-[hsl(var(--warning))]" />
              <span>Isolated Docker Containers</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5 text-[hsl(var(--info))]" />
              <span>Real-time Presence</span>
            </span>
          </div>
          <p>© {new Date().getFullYear()} CodeSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
