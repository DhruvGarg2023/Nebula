import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] px-3 py-2 text-sm text-[hsl(var(--foreground))] shadow-xs transition-colors placeholder:text-[hsl(var(--gray-10))] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[hsl(var(--error))] focus-visible:border-[hsl(var(--error))] focus-visible:ring-[hsl(var(--error))]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
