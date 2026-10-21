import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const styles = {
    default: 'bg-zinc-850 border-zinc-750 text-zinc-300',
    success: 'bg-volt/10 border-volt/30 text-volt',
    warning: 'bg-amber-400/10 border-amber-400/30 text-amber-300',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    gold: 'bg-volt/10 border-volt/30 text-volt',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
