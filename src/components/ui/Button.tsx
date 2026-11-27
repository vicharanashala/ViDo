import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none hover:shadow-[var(--glow-interactive)] hover:border-[var(--glow-border)] hover:delay-100 hover:duration-300';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[var(--accent)] text-[var(--accent-ink)] font-semibold hover:opacity-90 active:opacity-95 focus-visible:outline-[var(--accent)] shadow-sm transition-all',
    secondary:
      'bg-[var(--surface-glass)] text-[var(--ink)] border border-[var(--line-glass)] backdrop-blur-xl hover:bg-[var(--surface-glass-card)] active:opacity-90 focus-visible:outline-[var(--accent)] shadow-xs transition-all',
    ghost:
      'bg-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] focus-visible:outline-[var(--accent)]',
    danger:
      'bg-[var(--red)] text-white hover:opacity-90 active:opacity-95 focus-visible:outline-[var(--red)] shadow-sm',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

