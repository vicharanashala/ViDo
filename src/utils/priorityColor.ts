export interface PriorityColors {
  high?: string;
  medium?: string;
  low?: string;
}

export const DEFAULT_PRIORITY_COLORS: Required<PriorityColors> = {
  high: '#ef4444',    // Subtle Red
  medium: '#eab308',  // Subtle Amber / Yellow
  low: '',            // Neutral
};

/**
 * Converts a hex or named CSS color string to rgba with specified opacity.
 * Ensures the color is rendered as a minimal, non-bold soft card wash.
 */
export function hexToRgba(colorStr?: string, alpha = 0.08): string {
  if (!colorStr || colorStr === 'none') return '';
  const c = colorStr.trim().toLowerCase();

  const namedMap: Record<string, string> = {
    red: '#ef4444',
    yellow: '#eab308',
    orange: '#f97316',
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#a855f7',
    pink: '#ec4899',
    rose: '#f43f5e',
    amber: '#f59e0b',
  };
  const hex = namedMap[c] || c;

  if (hex.startsWith('#')) {
    let raw = hex.slice(1);
    if (raw.length === 3) {
      raw = raw.split('').map((char) => char + char).join('');
    }
    if (raw.length === 6) {
      const r = parseInt(raw.slice(0, 2), 16);
      const g = parseInt(raw.slice(2, 4), 16);
      const b = parseInt(raw.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
  }
  return hex;
}

/**
 * Returns minimal, aesthetic inline styles for a priority task card.
 * High -> default red tint
 * Mid -> default amber/yellow tint
 * Low -> none (empty object, preserves standard theme card background)
 */
export function getTaskPriorityCardStyle(
  priority?: string,
  priorityColors?: PriorityColors,
  isExpanded = false
): React.CSSProperties {
  const p = priority || 'low';
  const highColor = priorityColors?.high !== undefined ? priorityColors.high : DEFAULT_PRIORITY_COLORS.high;
  const midColor = priorityColors?.medium !== undefined ? priorityColors.medium : DEFAULT_PRIORITY_COLORS.medium;
  const lowColor = priorityColors?.low !== undefined ? priorityColors.low : DEFAULT_PRIORITY_COLORS.low;

  let color = '';
  if (p === 'high') color = highColor;
  else if (p === 'medium') color = midColor;
  else if (p === 'low') color = lowColor;

  if (!color || color === 'none' || color.trim() === '') {
    return {};
  }

  // Translucent background tint and delicate border
  const bgAlpha = isExpanded ? 0.12 : 0.07;
  const borderAlpha = isExpanded ? 0.45 : 0.25;

  const bgRgba = hexToRgba(color, bgAlpha);
  const borderRgba = hexToRgba(color, borderAlpha);

  return {
    backgroundColor: bgRgba,
    borderColor: borderRgba,
  };
}
