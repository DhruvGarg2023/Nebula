"use client";

import * as React from "react";
import { ChevronDown, Check, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  value: string;
  onChange: (languageId: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * LanguageSelector — dropdown menu to select Monaco editor language.
 * 
 * Styled after Linear/Vercel selectors:
 * - Shows current active language badge
 * - Highlights selected item with green checkmark
 * - Supports disabled (read-only viewer) state
 */
export function LanguageSelector({
  value,
  onChange,
  disabled = false,
  className,
}: LanguageSelectorProps) {
  const selectedLang = React.useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.value === value) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [value]);

  const triggerButton = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        "h-7 gap-1.5 px-2.5 text-xs font-normal border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--gray-3))]",
        className
      )}
    >
      <Code2 className="size-3.5 text-[hsl(var(--accent-9))]" />
      <span>{selectedLang.label}</span>
      <ChevronDown className="size-3 opacity-60" />
    </Button>
  );

  return (
    <DropdownMenu
      trigger={triggerButton}
      align="left"
      className="w-48"
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = lang.value === selectedLang.value;
        return (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => !disabled && onChange(lang.value)}
            className="flex items-center justify-between text-xs"
          >
            <span>{lang.label}</span>
            {isSelected && (
              <Check className="size-3.5 text-emerald-500" />
            )}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenu>
  );
}
