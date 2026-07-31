import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  pulse?: boolean;
}

export function Badge({ className, variant = 'default', pulse = false, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    primary: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
    info: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
    outline: 'bg-transparent text-slate-400 border-slate-700/80',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
