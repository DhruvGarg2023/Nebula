'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Code2,
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Settings,
  Bell,
  Command as CmdIcon,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Rooms & Code', href: '/rooms', icon: Code2 },
  { name: 'AI Reviews', href: '/ai-reviews', icon: Sparkles },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'GitHub Integration', href: '/settings/github', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Nexus Code <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-500">Collaborative AI IDE</p>
          </div>
        </Link>

        {/* Quick Command Trigger */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            document.dispatchEvent(event);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          <span className="flex items-center gap-2">
            <CmdIcon className="w-3.5 h-3.5 text-indigo-400" />
            Quick Command...
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                  isActive
                    ? 'text-white bg-indigo-600/15 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Status */}
      <div className="pt-4 border-t border-slate-800/60">
        <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 text-[11px]">Judge0 Runtime Ready</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v1.4.0</span>
        </div>
      </div>
    </aside>
  );
}
