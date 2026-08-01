"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  label?: string;
  toastMessage?: string;
}

/**
 * Click-to-copy button with animated checkmark and Sonner toast notification.
 */
export function CopyButton({
  text,
  label,
  toastMessage = "Copied to clipboard",
  variant = "outline",
  size = "sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("gap-1.5", className)}
      {...props}
    >
      {copied ? (
        <Check className="size-3.5 text-[hsl(var(--success))]" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </Button>
  );
}
