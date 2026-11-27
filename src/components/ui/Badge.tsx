import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-1.5',
  }[size];

  const variantStyles = {
    neutral: 'bg-[var(--canvas)] text-[var(--muted)] border border-[var(--line)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold',
    success: 'bg-[var(--green-soft)] text-[var(--green)] font-semibold',
    warning: 'bg-[var(--amber-soft)] text-[var(--amber)] font-semibold',
    danger: 'bg-[var(--red-soft)] text-[var(--red)] font-semibold',
  }[variant];

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  );
};

