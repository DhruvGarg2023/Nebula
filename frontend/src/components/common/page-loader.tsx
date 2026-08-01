"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * PageLoader component with a sleek pulsing logo and shimmering ring.
 */
export function PageLoader({
  label = "Loading...",
  className,
  fullScreen = false,
}: PageLoaderProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        fullScreen ? "fixed inset-0 z-50 bg-[hsl(var(--background))]" : "py-16",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute size-14 rounded-full bg-[hsl(var(--accent-9))/0.2] blur-sm"
        />

        {/* Center icon box */}
        <div className="relative flex size-12 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm">
          <Code2 className="size-6 animate-pulse" />
        </div>
      </div>

      {label && (
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  return content;
}
