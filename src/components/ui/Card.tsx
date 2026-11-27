import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-card rounded-xl p-5 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-[var(--glow-interactive)] hover:border-[var(--glow-border)] hover:delay-100 hover:duration-300 cursor-pointer hover:bg-[var(--surface-glass)]/90' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
