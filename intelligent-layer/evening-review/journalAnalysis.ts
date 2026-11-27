import type { JournalAnalysis, JournalAnalysisTag } from '../../src/data/journalTypes';

interface Topic {
  label: string;
  pattern: RegExp;
}

const TOPICS: Topic[] = [
  {
    label: 'meetings',
    pattern: /\b(meeting|meetings|stand-?up|stand-?ups|sync|syncs|call|calls)\b/gi,
  },
  {
    label: 'interruptions',
    pattern: /\b(interrupt|interrupted|interruptions|distracted|context switch|context switches|pulled away|pinged)\b/gi,
  },
  {
    label: 'deadline pressure',
    pattern: /\b(deadline pressure|deadlines?|due date|pressure|crunch|running late|behind)\b/gi,
  },
  {
    label: 'focus time',
    pattern: /\b(focus|focused|deep work|in the zone|flow|concentrated|quiet)\b/gi,
  },
  {
    label: 'energy',
    pattern: /\b(tired|drained|exhausted|low energy|worn out|restless)\b/gi,
  },
  {
    label: 'admin',
    pattern: /\b(admin|admin work|email|emails|paperwork|logistics|errands)\b/gi,
  },
  {
    label: 'collaboration',
    pattern: /\b(review|reviews|feedback|pairing|paired|blocked by|waiting on|handoff)\b/gi,
  },
];

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(new RegExp(pattern.source, pattern.flags));
  return matches ? matches.length : 0;
}

function buildSummary(tags: JournalAnalysisTag[]): string {
  if (tags.length === 0) return '';
  const parts = tags.map((tag) => `${tag.label} (${tag.count})`);
  if (parts.length === 1) return `This note mentioned ${parts[0]}.`;
  return `This note mentioned ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}.`;
}

/**
 * Local, deterministic scan of a work-scoped write-up.
 * Personal-life vocabulary is deliberately not in the lexicon, so it produces
 * no signal instead of an inference about the person.
 */
export function analyseNote(text: string): JournalAnalysis {
  const trimmed = text.trim();
  if (!trimmed) return { tags: [], summary: '' };

  const tags = TOPICS.map((topic) => ({
    label: topic.label,
    count: countMatches(trimmed, topic.pattern),
  }))
    .filter((tag) => tag.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return { tags, summary: buildSummary(tags) };
}
