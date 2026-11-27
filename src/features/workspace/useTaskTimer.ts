import { useCallback, useEffect, useRef, useState } from 'react';
import { flushMinutes } from '../../data/focusTimer';

export interface TaskTimer {
  elapsed: number;
  running: boolean;
  start: () => void;
  pause: () => void;
}

function nowSecondsStarted(startedAt: number | null): number {
  return startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000);
}

/**
 * Optional count-up timer shared by Focus mode and the task sheet.
 * Whole minutes are logged on pause or unmount; the remainder carries over.
 */
export function useTaskTimer(
  taskId: string,
  onLogTime?: (id: string, minutes: number) => void
): TaskTimer {
  const accumulatedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const taskIdRef = useRef(taskId);
  const previousTaskIdRef = useRef(taskId);
  const onLogRef = useRef(onLogTime);
  const [running, setRunning] = useState(false);
  const [, setTick] = useState(0);

  taskIdRef.current = taskId;
  onLogRef.current = onLogTime;

  const flush = useCallback((targetId: string) => {
    if (startedAtRef.current === null) return;
    const total = accumulatedRef.current + nowSecondsStarted(startedAtRef.current);
    const { minutes, remainderSeconds } = flushMinutes(total);
    accumulatedRef.current = remainderSeconds;
    startedAtRef.current = null;
    setRunning(false);
    if (minutes > 0) onLogRef.current?.(targetId, minutes);
  }, []);

  const pause = useCallback(() => {
    flush(taskIdRef.current);
  }, [flush]);

  const start = useCallback(() => {
    if (startedAtRef.current !== null) return;
    startedAtRef.current = Date.now();
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (previousTaskIdRef.current === taskId) return;
    flush(previousTaskIdRef.current);
    previousTaskIdRef.current = taskId;
    accumulatedRef.current = 0;
    startedAtRef.current = null;
    setRunning(false);
  }, [taskId, flush]);

  useEffect(() => {
    return () => flush(previousTaskIdRef.current);
  }, [flush]);

  const elapsed = accumulatedRef.current + nowSecondsStarted(startedAtRef.current);
  return { elapsed, running, start, pause };
}
