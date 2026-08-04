"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PresenceMember {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  color?: string;
  isOnline?: boolean;
}

interface PresenceAvatarsProps {
  members: PresenceMember[];
  maxDisplay?: number;
  className?: string;
}

/**
 * PresenceAvatars — stacked online member avatars for real-time collaboration.
 * 
 * Styled after Linear/Figma multiplayer avatar stacks:
 * - Overlapping circular avatars with border ring
 * - Online indicator green dot
 * - Tooltip showing member name
 * - Overflow count badge (+N)
 */
export function PresenceAvatars({
  members,
  maxDisplay = 5,
  className,
}: PresenceAvatarsProps) {
  const safeMembers = Array.isArray(members) ? members : [];
  if (safeMembers.length === 0) {
    return null;
  }

  const displayMembers = safeMembers.slice(0, maxDisplay);
  const overflowCount = Math.max(0, safeMembers.length - maxDisplay);

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {displayMembers.map((member) => (
        <Tooltip key={member.id} content={member.name}>
          <div className="relative inline-block transition-transform hover:z-10 hover:scale-105">
            <Avatar
              src={member.avatarUrl}
              name={member.name}
              size="sm"
              className="size-7 border-2 border-[hsl(var(--background))] bg-[hsl(var(--gray-2))]"
            />
            {member.isOnline && (
              <span className="absolute bottom-0 right-0 size-2 rounded-full border border-[hsl(var(--background))] bg-emerald-500" />
            )}
          </div>
        </Tooltip>
      ))}

      {overflowCount > 0 && (
        <Tooltip content={`${overflowCount} more online`}>
          <div className="flex size-7 items-center justify-center rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--gray-3))] text-[10px] font-medium text-[hsl(var(--muted-foreground))] transition-transform hover:z-10 hover:scale-105">
            +{overflowCount}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
