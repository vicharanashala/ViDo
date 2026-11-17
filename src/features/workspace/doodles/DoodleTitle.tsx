import React from 'react';
import { detectDoodle } from './doodleMap';
import { Doodle } from './Doodles';

const SIZE_CLASSES = {
  sm: 'h-6 w-9',
  md: 'h-9 w-[54px]',
  lg: 'h-12 w-[72px]',
  xl: 'h-16 w-24',
} as const;

export interface DoodleTitleProps {
  title: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export const DoodleTitle: React.FC<DoodleTitleProps> = ({ title, size = 'md', className = '' }) => {
  const kind = detectDoodle(title);

  if (!kind) {
    return <span className={className}>{title}</span>;
  }

  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={`inline-flex items-center shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      <Doodle kind={kind} />
    </span>
  );
};
