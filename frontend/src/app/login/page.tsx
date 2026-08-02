"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Code2,
  Terminal,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { AuthCard } from "@/components/auth/auth-card";
import { PageLoader } from "@/components/common/page-loader";
import { GoogleIcon } from "@/components/common/google-icon";
import { Button } from "@/components/ui/button";
import { authApi } from "@/services/api/auth";
import { ROUTES } from "@/lib/constants";

/**
 * Interactive left-side IDE code illustration for desktop split-screen layout.
 * Accurately implements Section 5.2 of frontend_architecture_plan.md.
 */
function VisualIllustrationPanel() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] p-10 lg:flex select-none">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-[radial-gradient(circle,hsl(var(--accent-9)/0.2)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.15)_0%,transparent_70%)] blur-3xl" />

      {/* Top brand header */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
          <Code2 className="size-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
            CodeSync
          </span>
          <span className="ml-2 rounded bg-[hsl(var(--accent-3))] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[hsl(var(--accent-11))]">
            v2.0 ENTERPRISE
          </span>
        </div>
      </div>

      {/* Main interactive code editor illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 my-auto w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.9] p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* IDE Top bar decoration */}
        <div className="mb-4 flex items-center justify-between border-b border-[hsl(var(--border))/0.6] pb-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F56]" />
            <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="size-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[hsl(var(--muted-foreground))]">
            <span className="rounded bg-[hsl(var(--gray-3))] px-2 py-0.5">
              CRDT-sync.ts
            </span>
            <span className="size-1.5 rounded-full bg-[hsl(var(--success))]" />
            <span className="text-[11px] text-[hsl(var(--success))]">
              Connected (2 editors)
            </span>
          </div>
        </div>

        {/* Code mockup */}
        <pre className="font-mono text-xs leading-relaxed text-[hsl(var(--foreground))] overflow-x-auto">
          <code>
            <span className="text-[hsl(var(--accent-9))]">import</span> &#123;{" "}
            <span className="text-[hsl(var(--info))]">YDoc</span>,{" "}
            <span className="text-[hsl(var(--info))]">WebsocketProvider</span>{" "}
            &#125; <span className="text-[hsl(var(--accent-9))]">from</span>{" "}
            <span className="text-[hsl(var(--warning))]">&quot;yjs&quot;</span>;{"\n"}
            {"\n"}
            <span className="text-[hsl(var(--muted-foreground))]">
              // Real-time sub-millisecond CRDT sync
            </span>
            {"\n"}
            <span className="text-[hsl(var(--accent-9))]">const</span> doc ={" "}
            <span className="text-[hsl(var(--accent-9))]">new</span>{" "}
            <span className="text-[hsl(var(--info))]">YDoc()</span>;{"\n"}
            <span className="text-[hsl(var(--accent-9))]">const</span> provider ={" "}
            <span className="text-[hsl(var(--accent-9))]">new</span>{" "}
            <span className="text-[hsl(var(--info))]">WebsocketProvider</span>
            (&quot;wss://codesync.dev/ws&quot;, doc);{"\n"}
            {"\n"}
            doc.on(<span className="text-[hsl(var(--warning))]">&quot;update&quot;</span>, ()
            =&gt; &#123;{"\n"}
            {"  "}
            <span className="text-[hsl(var(--info))]">console</span>.log(
            <span className="text-[hsl(var(--warning))]">
              &quot;Sync complete in 0.4ms&quot;
            </span>
            );{"\n"}
            &#125;);
          </code>
        </pre>

        {/* Live avatars floating badge */}
        <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))/0.6] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <Layers className="size-3.5 text-[hsl(var(--accent-9))]" />
            <span>Multi-language Docker execution ready</span>
          </div>
          <span className="rounded-full bg-[hsl(var(--success-bg))] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--success))]">
            ONLINE
          </span>
        </div>
      </motion.div>

      {/* Bottom feature bullets */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <CheckCircle2 className="size-4 text-[hsl(var(--success))]" />
          <span>Google OAuth 2.0 Enterprise Single Sign-On (SSO)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <CheckCircle2 className="size-4 text-[hsl(var(--success))]" />
          <span>Instant Developer Mode for local testing and staging</span>
        </div>
        <p className="text-xs text-[hsl(var(--gray-9))]">
          © {new Date().getFullYear()} CodeSync. Built for modern engineering teams.
        </p>
      </div>
    </div>
  );
}

/**
 * Right-side authentication card with branded GoogleLoginButton and DevLoginForm shortcut.
 */
function LoginCardHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [redirecting, setRedirecting] = React.useState(false);

  const returnUrl = React.useMemo(() => {
    return searchParams.get("from") || ROUTES.DASHBOARD;
  }, [searchParams]);

  // Handle URL error parameters (?error=auth_failed or ?error=callback_failed) per Section 5.2
  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_failed") {
      toast.error("Google authentication failed. Please try again.");
    } else if (errorParam === "callback_failed") {
      toast.error("OAuth callback error. Unable to complete sign-in.");
    }
  }, [searchParams]);

  // Automatically redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isLoading, isAuthenticated, router, returnUrl]);

  const handleGoogleLogin = () => {
    setRedirecting(true);
    window.location.href = authApi.getGoogleAuthUrl();
  };

  if (isLoading || (isAuthenticated && !redirecting)) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[hsl(var(--background))]">
        <PageLoader label="Checking existing session..." />
      </div>
    );
  }

  return (
    <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[hsl(var(--background))] p-6 sm:p-12">
      <AuthCard
        title="Sign in to CodeSync"
        description="Connect with Google to access your collaborative IDE workspace."
        footer={
          <div className="flex items-center justify-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <ShieldCheck className="size-3.5 text-[hsl(var(--success))]" />
            <span>256-bit encrypted single sign-on</span>
          </div>
        }
      >
        <div className="space-y-6">
          {/* ── Branded Google OAuth 2.0 Button (Primary) ── */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={redirecting}
            className="w-full h-12 text-sm font-semibold shadow-md gap-3 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
          >
            <GoogleIcon className="size-5" />
            <span>
              {redirecting
                ? "Redirecting to Google..."
                : "Continue with Google"}
            </span>
          </Button>

          {/* ── Divider ──────────────────────────────────── */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <span className="relative bg-[hsl(var(--card))] px-3 text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Or for dev / staging
            </span>
          </div>

          {/* ── Developer Login Form Shortcut ────────────── */}
          <Link href={ROUTES.DEV_LOGIN} className="block w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-xs font-medium gap-2 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/0.6]"
            >
              <Terminal className="size-4 text-[hsl(var(--accent-9))]" />
              <span>Developer Login (Local Testing)</span>
              <ArrowRight className="ml-auto size-3.5 text-[hsl(var(--muted-foreground))]" />
            </Button>
          </Link>

          {/* ── Feature Highlight Badges ─────────────────── */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.5] p-2.5 text-center">
              <Zap className="size-4 text-[hsl(var(--accent-9))] mb-1" />
              <span className="text-[10px] font-semibold text-[hsl(var(--foreground))]">
                Real-time
              </span>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                CRDT Sync
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.5] p-2.5 text-center">
              <Terminal className="size-4 text-[hsl(var(--info))] mb-1" />
              <span className="text-[10px] font-semibold text-[hsl(var(--foreground))]">
                Multi-Lang
              </span>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                Docker Run
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.5] p-2.5 text-center">
              <Sparkles className="size-4 text-[hsl(var(--warning))] mb-1" />
              <span className="text-[10px] font-semibold text-[hsl(var(--foreground))]">
                AI Powered
              </span>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                Code Review
              </span>
            </div>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

/**
 * Main Login Page (/login).
 * Implements Section 5.2 of frontend_architecture_plan.md:
 * Split-screen layout (left panel illustration + right panel login card with Google OAuth).
 */
export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-dvh w-full items-center justify-center bg-[hsl(var(--background))]">
          <PageLoader label="Loading sign-in..." />
        </div>
      }
    >
      <div className="flex min-h-dvh w-full bg-[hsl(var(--background))]">
        <VisualIllustrationPanel />
        <LoginCardHandler />
      </div>
    </React.Suspense>
  );
}
