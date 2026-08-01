"use client";

import * as React from "react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimeAgoProps {
  date: string | Date | number;
  addSuffix?: boolean;
  className?: string;
}

/**
 * Relative time component (e.g., "5 minutes ago").
 * Shows exact formatted date on hover title tooltip.
 */
export function TimeAgo({
  date,
  addSuffix = true,
  className,
}: TimeAgoProps) {
  const parsedDate = React.useMemo(() => {
    try {
      return typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    } catch {
      return new Date();
    }
  }, [date]);

  const [relativeTime, setRelativeTime] = React.useState<string>(() => {
    try {
      return formatDistanceToNow(parsedDate, { addSuffix });
    } catch {
      return "just now";
    }
  });

  // Update relative time every 60 seconds
  React.useEffect(() => {
    const update = () => {
      try {
        setRelativeTime(formatDistanceToNow(parsedDate, { addSuffix }));
      } catch {
        setRelativeTime("just now");
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [parsedDate, addSuffix]);

  const exactFormatted = React.useMemo(() => {
    try {
      return format(parsedDate, "PPpp");
    } catch {
      return "";
    }
  }, [parsedDate]);

  return (
    <time
      dateTime={parsedDate.toISOString()}
      title={exactFormatted}
      className={cn("text-xs text-[hsl(var(--muted-foreground))]", className)}
    >
      {relativeTime}
    </time>
  );
}
