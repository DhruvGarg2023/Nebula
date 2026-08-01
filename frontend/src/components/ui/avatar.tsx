"use client";

import * as React from "react";
import { cn, getInitials, stringToColor } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
  xl: "size-12 text-base",
};

export function Avatar({
  src,
  alt = "Avatar",
  name = "",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const initials = React.useMemo(() => getInitials(name || alt), [name, alt]);
  const bgColor = React.useMemo(() => stringToColor(name || alt || "default"), [name, alt]);

  const showImage = src && !imageError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none",
        sizeClasses[size],
        className
      )}
      style={!showImage ? { backgroundColor: bgColor, color: "#ffffff" } : undefined}
      {...props}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="aspect-square size-full object-cover"
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}
