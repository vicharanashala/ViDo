import type { NewTaskInput, TaskCategory, TaskPriority } from './taskTypes';
import { addDays, relativeDayLabel, toDateKey } from './taskDates';

export interface QuickAddMeta {
  dateLabel?: string;
  timeLabel?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
}

export interface ParsedQuickAdd extends NewTaskInput {
  meta: QuickAddMeta;
}

const PRIORITY_TOKENS: Record<string, TaskPriority> = {
  '!high': 'high',
  '!urgent': 'high',
  '!medium': 'medium',
  '!med': 'medium',
  '!low': 'low',
};

const CATEGORY_TOKENS: Record<string, TaskCategory> = {
  '#personal': 'personal',
  '#home': 'home',
  '#work': 'work',
};

const DATE_PATTERN = /\b(today|tomorrow|next week)\b/i;
const TWELVE_HOUR_PATTERN = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const TWENTY_FOUR_HOUR_PATTERN = /\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/;

function normalizeTime(hours: number, minutes: number, meridiem?: string): string {
  let hour = hours;
  if (meridiem) {
    const lower = meridiem.toLowerCase();
    if (lower === 'pm' && hour < 12) hour += 12;
    if (lower === 'am' && hour === 12) hour = 0;
  }
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function cleanTitle(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^[\s,.;:!?-]+|[\s,.;:!?-]+$/g, '')
    .trim();
}

export function parseQuickAdd(input: string, reference: Date = new Date()): ParsedQuickAdd {
  let working = input;
  const meta: QuickAddMeta = {};

  let dayOffset = 0;
  const dateMatch = working.match(DATE_PATTERN);
  if (dateMatch) {
    const token = dateMatch[1].toLowerCase();
    dayOffset = token === 'tomorrow' ? 1 : token === 'next week' ? 7 : 0;
    working = working.replace(dateMatch[0], ' ');
  }

  let dueTime: string | undefined;
  const twelveHourMatch = working.match(TWELVE_HOUR_PATTERN);
  if (twelveHourMatch) {
    dueTime = normalizeTime(
      Number(twelveHourMatch[1]),
      Number(twelveHourMatch[2] ?? 0),
      twelveHourMatch[3]
    );
    working = working.replace(twelveHourMatch[0], ' ');
  } else {
    const twentyFourHourMatch = working.match(TWENTY_FOUR_HOUR_PATTERN);
    if (twentyFourHourMatch) {
      dueTime = normalizeTime(Number(twentyFourHourMatch[1]), Number(twentyFourHourMatch[2]));
      working = working.replace(twentyFourHourMatch[0], ' ');
    }
  }

  let priority: TaskPriority = 'medium';
  const priorityMatch = working.match(/!(high|urgent|medium|med|low)\b/i);
  if (priorityMatch) {
    priority = PRIORITY_TOKENS[`!${priorityMatch[1].toLowerCase()}`] ?? 'medium';
    meta.priority = priority;
    working = working.replace(priorityMatch[0], ' ');
  }

  let category: TaskCategory = 'personal';
  const categoryMatch = working.match(/#(personal|home|work)\b/i);
  if (categoryMatch) {
    category = CATEGORY_TOKENS[`#${categoryMatch[1].toLowerCase()}`] ?? 'personal';
    meta.category = category;
    working = working.replace(categoryMatch[0], ' ');
  }

  const dueDate = toDateKey(addDays(reference, dayOffset));
  if (dateMatch) {
    meta.dateLabel = relativeDayLabel(dueDate, reference);
  }
  if (dueTime) {
    meta.timeLabel = dueTime;
  }

  return {
    title: cleanTitle(working),
    dueDate,
    dueTime,
    priority,
    category,
    meta,
  };
}
