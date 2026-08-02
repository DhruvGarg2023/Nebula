"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { PageLoader } from "@/components/common/page-loader";
import { ROUTES } from "@/lib/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackLabel?: string;
}

/**
 * Higher-order wrapper protecting authenticated routes.
 * Redirects unauthenticated users to `/login?from=...` after session check.
 */
export function ProtectedRoute({
  children,
  fallbackLabel = "Verifying session...",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${ROUTES.LOGIN}?from=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[hsl(var(--background))]">
        <PageLoader label={fallbackLabel} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
