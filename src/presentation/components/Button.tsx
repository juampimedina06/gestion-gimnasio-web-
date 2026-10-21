import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'volt';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] select-none';

  const variantStyles = {
    primary:
      'bg-volt text-black hover:bg-volt-hover font-bold shadow-md shadow-volt/15 focus:ring-volt',
    volt:
      'bg-volt text-black hover:bg-volt-hover font-bold shadow-md shadow-volt/15 focus:ring-volt',
    secondary:
      'bg-dark-card border border-dark-border text-zinc-200 hover:bg-zinc-800 hover:text-white focus:ring-zinc-600',
    outline:
      'border border-zinc-700 hover:border-volt text-zinc-200 hover:text-volt hover:bg-volt/5 focus:ring-volt',
    danger:
      'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 focus:ring-rose-500',
    ghost:
      'text-zinc-400 hover:text-white hover:bg-dark-card focus:ring-zinc-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm uppercase tracking-wider font-bold',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
        <span>{children}</span>
      </span>
    </button>
  );
};
