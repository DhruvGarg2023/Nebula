"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  showShortcut?: boolean;
}

/**
 * Debounced search input component with search icon, clear button,
 * and optional keyboard shortcut hint.
 */
export function SearchInput({
  value,
  defaultValue = "",
  onSearchChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  showShortcut = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  // Debounced callback
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange?.(currentValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [currentValue, debounceMs, onSearchChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (value === undefined) {
      setInternalValue(val);
    } else {
      onSearchChange?.(val);
    }
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue("");
    }
    onSearchChange?.("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut '/' to focus
  React.useEffect(() => {
    if (!showShortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(
          (e.target as HTMLElement)?.tagName || ""
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcut]);

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute left-3 size-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))] pl-9 pr-9 py-1 text-sm text-[hsl(var(--foreground))] shadow-xs transition-colors placeholder:text-[hsl(var(--gray-10))] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
      />
      {currentValue ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 rounded-sm p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      ) : showShortcut ? (
        <kbd className="absolute right-2.5 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
          /
        </kbd>
      ) : null}
    </div>
  );
}
