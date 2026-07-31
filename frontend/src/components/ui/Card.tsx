'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({ className, interactive = false, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass-card rounded-xl p-5 border border-slate-800/80 transition-colors duration-200',
        interactive && 'hover:border-indigo-500/40 hover:shadow-indigo-500/10 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4 space-y-1', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold text-white tracking-tight', className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-xs text-slate-400 leading-relaxed', className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between', className)}>{children}</div>;
}
