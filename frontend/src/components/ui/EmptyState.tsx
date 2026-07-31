'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-800/80 my-4',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-5">{description}</p>
      {action}
    </motion.div>
  );
}
