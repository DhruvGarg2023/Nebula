import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-[hsl(var(--border))] bg-[hsl(var(--gray-4))] text-[hsl(var(--gray-11))]",
        success:
          "border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]",
        warning:
          "border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))]",
        error:
          "border border-[hsl(var(--error)/0.3)] bg-[hsl(var(--error-bg))] text-[hsl(var(--error))]",
        info:
          "border border-[hsl(var(--info)/0.3)] bg-[hsl(var(--info-bg))] text-[hsl(var(--info))]",
        accent:
          "border border-[hsl(var(--accent-6))] bg-[hsl(var(--accent-3))] text-[hsl(var(--accent-11))]",
        outline:
          "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
