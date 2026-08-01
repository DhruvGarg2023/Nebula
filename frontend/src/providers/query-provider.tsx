"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider with sensible defaults.
 * DevTools enabled in development only.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus in development (annoying during debugging)
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
            // Retry once on failure, then show error
            retry: 1,
            // Default stale time (30 seconds)
            staleTime: 30 * 1000,
          },
          mutations: {
            // Show error toast on mutation failure (handled by individual hooks)
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
