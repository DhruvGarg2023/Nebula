'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User as UserIcon, LogOut, Shield, GitBranch, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

export interface AppTopbarProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  presenceUsers?: Array<{ userId: string; name: string; avatarUrl?: string; color: string }>;
}

export function AppTopbar({ title, breadcrumbs = [], presenceUsers = [] }: AppTopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none shrink-0">
      {/* Breadcrumbs & Title */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Workspace</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-600">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-200 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-200 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
        {title && <h2 className="text-sm font-semibold text-white ml-2">{title}</h2>}
      </div>

      {/* Right Controls: Presence, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Presence Bar (Live active collaborators) */}
        {presenceUsers.length > 0 && (
          <div className="flex items-center -space-x-2 mr-2">
            {presenceUsers.map((u, i) => (
              <div
                key={u.userId || i}
                title={`${u.name} (Active)`}
                className="relative w-7 h-7 rounded-full border-2 border-[#080c14] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-md"
                style={{ backgroundColor: u.color || '#6366f1' }}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  u.name.charAt(0)
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#080c14]" />
              </div>
            ))}
          </div>
        )}

        {/* AI Quick Audit Trigger */}
        <Link
          href="/ai-reviews"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 text-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Audit</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </Link>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-semibold text-slate-200 hover:border-indigo-500/60 transition-colors"
          >
            <UserIcon className="w-4 h-4 text-slate-300" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl border border-slate-800 shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800/80">
                <p className="font-semibold text-slate-200">Developer Account</p>
                <p className="text-[11px] text-slate-400 truncate">dev@nexuscode.io</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/settings/github"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60"
              >
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <span>GitHub Connections</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 text-left border-t border-slate-800/80"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
