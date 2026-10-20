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
    default: 'bg-dark-card border-dark-border text-gray-300',
    success: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
    danger: 'bg-red-950/40 border-red-500/30 text-red-300',
    info: 'bg-blue-950/40 border-blue-500/30 text-blue-300',
    gold: 'bg-champagne-gold/15 border-champagne-gold/30 text-champagne-gold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
