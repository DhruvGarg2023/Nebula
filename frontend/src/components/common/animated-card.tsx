"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  interactive?: boolean;
}

/**
 * Card component with Framer Motion entrance animation, subtle lift on hover,
 * and optional border glow for a premium Linear/Vercel aesthetic.
 */
export function AnimatedCard({
  children,
  className,
  hoverGlow = true,
  interactive = true,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      whileHover={
        interactive
          ? {
              y: -2,
              transition: { duration: 0.2, ease: "easeOut" },
            }
          : undefined
      }
      className={cn(
        "group relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))] shadow-xs transition-colors duration-200",
        interactive && "cursor-pointer hover:border-[hsl(var(--gray-8))]",
        hoverGlow &&
          "hover:shadow-[var(--shadow-glow)] hover:border-[hsl(var(--accent-9)/0.5)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
