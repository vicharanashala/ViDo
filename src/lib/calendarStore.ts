import { getAuthHeaders } from './apiHeaders';
import type { CalendarEvent } from '../data/calendar';

// Memory cache for offline/testing fallback
const memoryEventsCache = new Map<string, CalendarEvent[]>();

export async function fetchCalendarEvents(uid?: string): Promise<CalendarEvent[]> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/calendar-events', { headers });
    if (!res.ok) {
      throw new Error(`Failed to load calendar events: ${res.statusText}`);
    }
    const data = await res.json();
    const events = Array.isArray(data) ? (data as CalendarEvent[]) : [];
    if (uid) memoryEventsCache.set(uid, events);
    return events;
  } catch (err: any) {
    if (uid && memoryEventsCache.has(uid)) {
      return memoryEventsCache.get(uid)!;
    }
    return [];
  }
}

export function subscribeCalendarEvents(
  uid: string,
  next: (events: CalendarEvent[]) => void,
  onError: (error: Error) => void
): () => void {
  let active = true;

  const poll = async () => {
    try {
      const events = await fetchCalendarEvents(uid);
      if (active) next(events);
    } catch (err: any) {
      if (active) onError(err);
    }
  };

  void poll();
  const interval = setInterval(() => void poll(), 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function createCalendarEvent(uid: string, event: CalendarEvent): Promise<void> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/calendar-events', {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      throw new Error(`Failed to create calendar event: ${res.statusText}`);
    }
    const created = await res.json();
    const current = memoryEventsCache.get(uid) || [];
    memoryEventsCache.set(uid, [created, ...current.filter((e) => e.id !== event.id)]);
  } catch (err) {
    const current = memoryEventsCache.get(uid) || [];
    memoryEventsCache.set(uid, [event, ...current.filter((e) => e.id !== event.id)]);
  }
}

export async function deleteCalendarEvent(uid: string, eventId: string): Promise<void> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch(`/api/user/calendar-events/${eventId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete calendar event: ${res.statusText}`);
    }
  } catch (err) {
    // offline/test
  }
  const current = memoryEventsCache.get(uid) || [];
  memoryEventsCache.set(
    uid,
    current.filter((e) => e.id !== eventId)
  );
}
