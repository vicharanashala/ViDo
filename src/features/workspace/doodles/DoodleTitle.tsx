import React from 'react';
import { detectDoodle } from './doodleMap';
import { Doodle } from './Doodles';
import type { TaskCategory } from '../../../data/taskTypes';
import { findCustomImageForTitle } from '../../../lib/customImages';

const IMAGE_SIZES = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
} as const;

export interface DoodleTitleProps {
  title: string;
  category?: TaskCategory;
  size?: keyof typeof IMAGE_SIZES;
  className?: string;
  customImageKey?: string;
  wrapTitle?: boolean;
  onImageClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

export const DoodleTitle: React.FC<DoodleTitleProps> = ({
  title,
  category,
  size = 'md',
  className = '',
  customImageKey,
  wrapTitle = false,
  onImageClick,
}) => {
  const customImage = findCustomImageForTitle(title, customImageKey);
  const kind = detectDoodle(title) ?? (category === 'work' ? 'project' : null);

  if (!customImage && !kind) {
    return <span className={className}>{title}</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span
        aria-hidden="true"
        onClick={onImageClick}
        className={`inline-flex shrink-0 overflow-hidden rounded-md ${IMAGE_SIZES[size]} ${
          onImageClick ? 'cursor-pointer' : ''
        }`}
      >
        {customImage ? (
          <img
            src={customImage.dataUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Doodle kind={kind!} style="cartoon" />
        )}
      </span>
      <span className={`${wrapTitle ? 'line-clamp-2' : 'truncate'} ${className}`}>{title}</span>
    </span>
  );
};
