export interface ParsedRRuleUI {
  freq: 'day' | 'week' | 'month' | 'year';
  interval: number;
  byDay: string[];
  ends: 'never' | 'on' | 'after';
  endDate: string;
  occurrences: number;
}

const DAY_NAME_MAP: Record<string, string> = {
  SU: 'Sun',
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
};

export function parseRRuleForUI(ruleStr?: string | null): ParsedRRuleUI {
  const result: ParsedRRuleUI = {
    freq: 'week',
    interval: 1,
    byDay: ['MO', 'TU', 'WE', 'TH', 'FR'],
    ends: 'never',
    endDate: '',
    occurrences: 30,
  };

  if (!ruleStr) return result;

  const upper = ruleStr.toUpperCase().replace(/^RRULE:/, '').trim();
  const parts = upper.split(';');

  for (const part of parts) {
    const [k, v] = part.split('=');
    if (!k || !v) continue;
    if (k === 'FREQ') {
      if (v === 'WEEKLY') result.freq = 'week';
      else if (v === 'MONTHLY') result.freq = 'month';
      else if (v === 'YEARLY') result.freq = 'year';
      else result.freq = 'day';
    } else if (k === 'INTERVAL') {
      const parsed = parseInt(v, 10);
      if (!isNaN(parsed) && parsed > 0) result.interval = parsed;
    } else if (k === 'BYDAY') {
      result.byDay = v.split(',').filter(Boolean);
    } else if (k === 'UNTIL') {
      const clean = v.replace('Z', '');
      if (clean.length >= 8) {
        result.ends = 'on';
        result.endDate = `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
      }
    } else if (k === 'COUNT') {
      const parsed = parseInt(v, 10);
      if (!isNaN(parsed) && parsed > 0) {
        result.ends = 'after';
        result.occurrences = parsed;
      }
    }
  }

  return result;
}

export function formatRecurrenceLabel(ruleStr?: string | null): string {
  if (!ruleStr) return 'Repeat';
  const parsed = parseRRuleForUI(ruleStr);

  let label = '';
  const interval = parsed.interval;

  if (parsed.freq === 'day') {
    label = interval === 1 ? 'Daily' : `Every ${interval} days`;
  } else if (parsed.freq === 'week') {
    if (parsed.byDay.length > 0) {
      const joined = parsed.byDay.join(',');
      if (joined === 'MO,TU,WE,TH,FR') {
        label = interval === 1 ? 'Weekdays (Mon–Fri)' : `Every ${interval} wks on weekdays`;
      } else if (joined === 'SA,SU' || joined === 'SU,SA') {
        label = interval === 1 ? 'Weekends (Sat–Sun)' : `Every ${interval} wks on weekends`;
      } else {
        const days = parsed.byDay.map((d) => DAY_NAME_MAP[d] || d).join(', ');
        label = interval === 1 ? `Weekly (${days})` : `Every ${interval} wks (${days})`;
      }
    } else {
      label = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    }
  } else if (parsed.freq === 'month') {
    label = interval === 1 ? 'Monthly' : `Every ${interval} months`;
  } else if (parsed.freq === 'year') {
    label = interval === 1 ? 'Yearly' : `Every ${interval} years`;
  }

  if (parsed.ends === 'on' && parsed.endDate) {
    label += ` until ${parsed.endDate}`;
  } else if (parsed.ends === 'after') {
    label += ` (${parsed.occurrences}x)`;
  }

  return label;
}

export function formatTaskDate(
  dateStr?: string | null,
  timeStr?: string | null,
  referenceDateStr?: string
): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  hasTime: boolean;
} {
  if (!dateStr) {
    return { label: 'Date/time', isOverdue: false, isToday: false, isTomorrow: false, hasTime: false };
  }

  // Normalize reference date
  const now = referenceDateStr ? new Date(`${referenceDateStr}T00:00:00`) : new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // If dateStr is pure YYYY-MM-DD
  let targetDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const timePart = timeStr ? `T${timeStr}:00` : 'T00:00:00';
    targetDate = new Date(`${dateStr}${timePart}`);
  } else {
    targetDate = new Date(dateStr);
  }

  if (isNaN(targetDate.getTime())) {
    return { label: 'Date/time', isOverdue: false, isToday: false, isTomorrow: false, hasTime: false };
  }

  const targetDayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const isToday = targetDayStart.getTime() === todayStart.getTime();
  const isTomorrow = targetDayStart.getTime() === tomorrowStart.getTime();
  const isOverdue = targetDayStart.getTime() < todayStart.getTime();

  const hasTime = !!timeStr || targetDate.getHours() !== 0 || targetDate.getMinutes() !== 0;

  const displayTime = timeStr || (hasTime
    ? targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '');

  let datePrefix = '';
  if (isToday) {
    datePrefix = 'Today';
  } else if (isTomorrow) {
    datePrefix = 'Tomorrow';
  } else {
    datePrefix = targetDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      ...(targetDate.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
    });
  }

  const label = displayTime ? `${datePrefix}, ${displayTime}` : datePrefix;

  return { label, isOverdue, isToday, isTomorrow, hasTime };
}
