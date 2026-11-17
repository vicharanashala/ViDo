import React from 'react';
import { detectDoodle } from './doodleMap';
import { Doodle } from './Doodles';

const IMAGE_SIZES = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
} as const;

export interface DoodleTitleProps {
  title: string;
  size?: keyof typeof IMAGE_SIZES;
  className?: string;
}

export const DoodleTitle: React.FC<DoodleTitleProps> = ({ title, size = 'md', className = '' }) => {
  const kind = detectDoodle(title);

  if (!kind) {
    return <span className={className}>{title}</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span aria-hidden="true" className={`inline-flex shrink-0 ${IMAGE_SIZES[size]}`}>
        <Doodle kind={kind} style="cartoon" />
      </span>
      <span className={`truncate ${className}`}>{title}</span>
    </span>
  );
};
