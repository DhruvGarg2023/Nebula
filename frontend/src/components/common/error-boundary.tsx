"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Production-grade Error Boundary.
 * Catches render errors and shows a sleek SaaS error fallback instead of crashing the tab.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-xl border border-[hsl(var(--error)/0.3)] bg-[hsl(var(--error-bg))] p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-[hsl(var(--error)/0.3)] bg-[hsl(var(--card))] text-[hsl(var(--error))] shadow-sm">
            <AlertTriangle className="size-6" />
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Something went wrong
          </h3>

          <p className="mt-1.5 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
            {this.state.error?.message ||
              "An unexpected error occurred while rendering this component."}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={this.handleReset}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
