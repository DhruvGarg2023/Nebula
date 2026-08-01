"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer select-none"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-1.5 min-w-[200px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1 text-[hsl(var(--popover-foreground))] shadow-lg",
              align === "right" ? "right-0" : "left-0",
              className
            )}
          >
            <div onClick={() => setOpen(false)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export function DropdownMenuItem({
  icon,
  shortcut,
  destructive,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))] focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        destructive
          ? "text-[hsl(var(--error))] hover:bg-[hsl(var(--error-bg))]"
          : "text-[hsl(var(--foreground))]",
        className
      )}
      {...props}
    >
      {icon && <span className="size-4 shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))] font-mono">
          {shortcut}
        </span>
      )}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return (
    <div className="my-1 h-[1px] w-full bg-[hsl(var(--border))]" />
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2.5 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] tracking-wider uppercase select-none",
        className
      )}
    >
      {children}
    </div>
  );
}
