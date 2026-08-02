"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { PageLoader } from "@/components/common/page-loader";
import { ROUTES } from "@/lib/constants";

/**
 * Inner OAuth Callback Handler per Section 5.3 of frontend_architecture_plan.md.
 * Handles Google OAuth callback redirect, stores access token, and redirects to dashboard.
 */
function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  React.useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      // Support both `accessToken` and `token` query params from backend OAuth redirect
      const token =
        searchParams.get("accessToken") || searchParams.get("token");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Per Section 5.3: on error state redirect to /login?error=callback_failed
      if (errorParam || errorDescription || !token) {
        if (isMounted) {
          toast.error(
            errorDescription || "Google sign-in was cancelled or failed."
          );
          router.replace(`${ROUTES.LOGIN}?error=callback_failed`);
        }
        return;
      }

      try {
        // Store access token in memory and fetch authenticated user profile from /users/me
        await login(token);

        if (isMounted) {
          toast.success("Successfully signed into CodeSync with Google");
          router.replace(ROUTES.DASHBOARD);
        }
      } catch {
        if (isMounted) {
          toast.error("Failed to restore session from Google token.");
          router.replace(`${ROUTES.LOGIN}?error=callback_failed`);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, login, router]);

  // Per Section 5.3: Full-page loader with "Signing you in..." text & pulsing logo
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[hsl(var(--background))]">
      <PageLoader label="Signing you in..." fullScreen={false} />
    </div>
  );
}

/**
 * Main OAuth Callback Page (/callback).
 * Implements Section 5.3 of frontend_architecture_plan.md.
 */
export default function OAuthCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-dvh w-full items-center justify-center bg-[hsl(var(--background))]">
          <PageLoader label="Signing you in..." fullScreen={false} />
        </div>
      }
    >
      <OAuthCallbackHandler />
    </React.Suspense>
  );
}
