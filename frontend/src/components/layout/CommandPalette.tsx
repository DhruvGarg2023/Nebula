'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  Code2,
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Settings,
  GitBranch,
  Search,
  Bell,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 p-4">
      <div className="w-full max-w-xl glass-panel rounded-xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <Command className="w-full bg-transparent text-slate-200">
          <div className="flex items-center border-b border-slate-800 px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <Command.Input
              placeholder="Type a command or search workspace..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none py-1"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-sm">
            <Command.Empty className="py-6 text-center text-xs text-slate-500">
              No results found for your query.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[11px] font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/rooms'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Collaborative Rooms & Repos</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/ai-reviews'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Code Review History</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/analytics'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Execution Analytics</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Settings & Actions" className="text-[11px] font-semibold text-slate-500 px-2 py-1 mt-2 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings/github'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <GitBranch className="w-4 h-4 text-slate-400" />
                <span>GitHub Integration Settings</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/notifications'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <Bell className="w-4 h-4 text-rose-400" />
                <span>Notifications Center</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings'))}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>User Preferences</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
