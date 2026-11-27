export type MoodWord = 'calm' | 'steady' | 'stretched' | 'heavy' | 'drained' | 'mixed';

export const MOOD_WORDS: { value: MoodWord; label: string }[] = [
  { value: 'calm', label: 'calm' },
  { value: 'steady', label: 'steady' },
  { value: 'stretched', label: 'stretched' },
  { value: 'heavy', label: 'heavy' },
  { value: 'drained', label: 'drained' },
  { value: 'mixed', label: 'mixed' },
];

export function moodLabel(mood: MoodWord): string {
  return MOOD_WORDS.find((item) => item.value === mood)?.label ?? mood;
}

export interface JournalAnalysisTag {
  label: string;
  count: number;
}

export interface JournalAnalysis {
  tags: JournalAnalysisTag[];
  summary: string;
}

export interface JournalEntry {
  id: string;
  dateKey: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export type TimeSource = 'timer' | 'manual' | 'none';

export interface TimeLogEntry {
  taskId: string;
  taskTitle: string;
  plannedMinutes?: number;
  actualMinutes?: number;
  source: TimeSource;
}

export interface EveningCheckInAnswer {
  question: string;
  answer: string;
}

export interface EveningCheckIn {
  dateKey: string;
  mood: MoodWord;
  answers: EveningCheckInAnswer[];
  movedTaskIds: string[];
  movedTaskTitles: string[];
  heavyTaskIds: string[];
  heavyTaskTitles: string[];
  lightTaskIds?: string[];
  lightTaskTitles?: string[];
  timeLog: TimeLogEntry[];
  note?: string;
  analysis?: JournalAnalysis;
  answeredAt: string;
}
