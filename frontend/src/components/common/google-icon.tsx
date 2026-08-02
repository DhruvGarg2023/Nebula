import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Official multicolor Google "G" logo SVG component.
 */
export function GoogleIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={cn("size-5", className)}
      {...props}
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.26 21.3 7.37 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24a7.18 7.18 0 0 1 0-4.48V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.27 6.61l4.01 3.15C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}
