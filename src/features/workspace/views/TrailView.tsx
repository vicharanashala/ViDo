import React from 'react';
import { ArrowDown, ArrowUp, Sparkles } from 'lucide-react';
import type { Task } from '../../../data/taskTypes';

export interface TrailViewProps {
  tasks: Task[];
}

const SIZE = 6;
const BOARD_MAX = SIZE * SIZE;

const LADDERS: Record<number, number> = {
  3: 11,
  8: 20,
  17: 28,
  24: 33,
};

const SNAKES: Record<number, number> = {
  14: 6,
  26: 15,
  34: 23,
};

function cellFor(number: number): { row: number; col: number } {
  const index = number - 1;
  const rowFromBottom = Math.floor(index / SIZE);
  const colInRow = index % SIZE;
  return {
    row: SIZE - 1 - rowFromBottom,
    col: rowFromBottom % 2 === 0 ? colInRow : SIZE - 1 - colInRow,
  };
}

function centerFor(number: number): { x: number; y: number } {
  const { row, col } = cellFor(number);
  return {
    x: (col + 0.5) * (100 / SIZE),
    y: (row + 0.5) * (100 / SIZE),
  };
}

type TrailMoveKind = 'step' | 'ladder' | 'snake';

interface TrailMove {
  key: string;
  task: Task;
  from: number;
  landed: number;
  to: number;
  kind: TrailMoveKind;
}

function trailMoves(completedTasks: Task[]): { moves: TrailMove[]; position: number } {
  let position = 1;
  const moves: TrailMove[] = [];

  completedTasks.forEach((task, index) => {
    const from = position;
    position = Math.min(BOARD_MAX, position + 1);
    const landed = position;
    let kind: TrailMoveKind = 'step';

    if (LADDERS[position]) {
      kind = 'ladder';
      position = LADDERS[position];
    } else if (SNAKES[position]) {
      kind = 'snake';
      position = SNAKES[position];
    }

    moves.push({
      key: `${task.id}-${index}`,
      task,
      from,
      landed,
      to: position,
      kind,
    });
  });

  return { moves, position };
}

const boardNumbers: number[] = [];
for (let row = 0; row < SIZE; row += 1) {
  const rowFromBottom = SIZE - 1 - row;
  for (let col = 0; col < SIZE; col += 1) {
    boardNumbers.push(
      rowFromBottom * SIZE + (rowFromBottom % 2 === 0 ? col + 1 : SIZE - col)
    );
  }
}

export const TrailView: React.FC<TrailViewProps> = ({ tasks }) => {
  const completedTasks = tasks
    .filter((task) => task.state === 'completed')
    .slice()
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));
  const completed = completedTasks.length;
  const allDone = tasks.length > 0 && tasks.every((task) => task.state === 'completed');
  const simulation = trailMoves(completedTasks);
  const position = allDone ? BOARD_MAX : simulation.position;
  const movementLog = simulation.moves.filter((move) => move.kind !== 'step').reverse();
  const token = centerFor(position);
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Momentum trail
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--ink)]">
              A little game of progress
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--muted)]">
              Every completed task moves your token one square. Ladders lift you; snakes are just
              gentle resets. No points, no streaks — only movement.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-4 py-3 text-center">
            <p className="font-mono text-2xl font-extrabold text-[var(--accent)]">{position}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
              {allDone || position === BOARD_MAX ? 'trail complete' : `square of ${BOARD_MAX}`}
            </p>
            {allDone && (
              <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--green)]">
                <Sparkles className="h-3 w-3" /> goal reached
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2 py-0.5">
            {completed} completed {completed === 1 ? 'task' : 'tasks'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--green)]/25 bg-[var(--green-soft)] px-2 py-0.5 font-semibold text-[var(--green)]">
            <ArrowUp className="h-3 w-3" /> ladder
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--amber)]/25 bg-[var(--amber-soft)] px-2 py-0.5 font-semibold text-[var(--amber)]">
            <ArrowDown className="h-3 w-3" /> gentle reset
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-2xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm sm:p-4">
        <div className="relative grid aspect-square grid-cols-6 grid-rows-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--canvas)]">
          {boardNumbers.map((number) => (
            <div
              key={number}
              className={`relative z-10 flex items-start justify-start border-[var(--line)] p-1.5 text-[10px] font-mono font-semibold sm:p-2 ${
                number === position
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : LADDERS[number]
                    ? 'bg-[var(--green-soft)]/70 text-[var(--green)]'
                    : SNAKES[number]
                      ? 'bg-[var(--amber-soft)]/70 text-[var(--amber)]'
                      : 'bg-[var(--surface)]/80 text-[var(--faint)]'
              } border-r border-b`}
            >
              {number}
            </div>
          ))}

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {Object.entries(LADDERS).map(([from, to]) => {
              const a = centerFor(Number(from));
              const b = centerFor(to);
              return (
                <line
                  key={`ladder-${from}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--green)"
                  strokeWidth="1.1"
                  strokeDasharray="2 2"
                  opacity="0.55"
                />
              );
            })}
            {Object.entries(SNAKES).map(([from, to]) => {
              const a = centerFor(Number(from));
              const b = centerFor(to);
              const midX = (a.x + b.x) / 2 + 10;
              const midY = (a.y + b.y) / 2;
              return (
                <path
                  key={`snake-${from}`}
                  d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
                  fill="none"
                  stroke="var(--amber)"
                  strokeWidth="1.2"
                  opacity="0.6"
                />
              );
            })}
          </svg>

          <span
            className="absolute z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--dark)] text-white shadow-lg ring-2 ring-[var(--surface)]"
            style={{ left: `${token.x}%`, top: `${token.y}%` }}
            aria-label={`Your token on square ${position}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-[var(--muted)]">
          <span>Start · square 1</span>
          <span>Trail complete · square {BOARD_MAX}</span>
        </div>
      </section>

      <section className="space-y-2.5">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)]">Trail log</h2>
          <p className="text-[11px] text-[var(--muted)]">
            Every ladder lift and gentle reset, with the task that caused it.
          </p>
        </div>
        {movementLog.length > 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {movementLog.map((move) => (
              <div
                key={move.key}
                className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-3.5 shadow-xs"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      move.kind === 'ladder'
                        ? 'bg-[var(--green-soft)] text-[var(--green)]'
                        : 'bg-[var(--amber-soft)] text-[var(--amber)]'
                    }`}
                  >
                    {move.kind === 'ladder' ? (
                      <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--ink)]">
                      {move.kind === 'ladder' ? 'Ladder' : 'Gentle reset'} · {move.landed} → {move.to}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      From completing “{move.task.title}”
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-center">
            <p className="text-xs text-[var(--muted)]">
              No ladder or snake landings yet. Complete a task and the trail will tell you what moved
              you.
            </p>
          </div>
        )}
        {allDone && (
          <div className="rounded-2xl border border-[var(--green)]/30 bg-[var(--green-soft)] p-4 text-center">
            <p className="text-sm font-bold text-[var(--green)]">Goal reached</p>
            <p className="mt-1 text-[11px] text-[var(--green)]/80">
              Every task is done. The trail ends here — you can add a new task whenever you want a new
              board.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
