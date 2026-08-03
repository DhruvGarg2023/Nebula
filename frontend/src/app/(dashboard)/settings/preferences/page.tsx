"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Laptop, Sliders, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Preferences Settings Page (/(dashboard)/settings/preferences)
 * Manages UI theme (dark/light/system) and local editor preferences.
 */
export default function PreferencesSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = React.useState("14");
  const [vimMode, setVimMode] = React.useState(false);

  // Restore editor settings from localStorage
  React.useEffect(() => {
    try {
      const savedFont = localStorage.getItem(STORAGE_KEYS.EDITOR_FONT_SIZE);
      if (savedFont) setFontSize(savedFont);
    } catch {}
  }, []);

  const handleSaveEditorPrefs = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_FONT_SIZE, fontSize);
      toast.success("Editor preferences saved!");
    } catch {
      toast.error("Failed to save to local storage");
    }
  };

  return (
    <div className="space-y-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
      {/* ── Theme Selection ─────────────────────────────────── */}
      <div className="space-y-3 border-b border-[hsl(var(--border))] pb-6">
        <div>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Appearance & Theme
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Customize how CodeSync looks on your device.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { value: "light", label: "Light", icon: <Sun className="size-4" /> },
            { value: "dark", label: "Dark", icon: <Moon className="size-4" /> },
            {
              value: "system",
              label: "System",
              icon: <Laptop className="size-4" />,
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTheme(item.value)}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-semibold transition-all ${
                theme === item.value
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))] shadow-xs"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.4] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Editor Preferences ─────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Editor Defaults
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Configure typography and keybindings for the Monaco CRDT editor.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="font-size" className="text-xs font-semibold">
            Editor Font Size (px)
          </Label>
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full h-10 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-mono"
          >
            <option value="12">12px (Compact)</option>
            <option value="14">14px (Default)</option>
            <option value="16">16px (Medium)</option>
            <option value="18">18px (Large)</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.3] p-3">
          <div>
            <Label htmlFor="vim-mode" className="text-xs font-semibold">
              Vim Keybindings
            </Label>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Enable modal Vim navigation inside the Monaco editor
            </p>
          </div>
          <Switch
            id="vim-mode"
            checked={vimMode}
            onCheckedChange={setVimMode}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button size="sm" onClick={handleSaveEditorPrefs} className="gap-1.5">
            <Check className="size-3.5" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
