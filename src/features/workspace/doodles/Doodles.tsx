import React from 'react';
import type { DoodleKind } from './doodleMap';

const INK = '#3b342c';

const base = {
  fill: 'none',
  stroke: INK,
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Laundry = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M6 20 C30 14 58 22 114 16" />
    <path d="M20 20 l-2 -6 M24 20 l-2 -6 M92 17 l-2 -6 M96 17 l-2 -6" />
    <path d="M28 22 l-10 -5 -9 7 6 7 5 -3 v28 h20 V28 l5 3 6 -7 -9 -7 -7 5 z" fill="#fbf6ec" />
    <path d="M35 22 v30 M31 30 h8" opacity=".45" />
    <path d="M64 19 l-4 8 -3 -3 -4 34 h10 l6 -20 6 20 h10 l-4 -34 -3 3 -4 -8 z" fill="#bcd6e6" />
    <path d="M70 24 v34" opacity=".5" />
    <path d="M104 17 v16 c0 6 -4 9 -8 9 c-4 0 -6 -3 -6 -7 v-4" fill="#f3c9b8" />
    <path d="M104 17 h-8 M104 22 h-8" opacity=".5" />
    <path d="M40 54 h36 l-5 18 H45 z" fill="#e2b57e" />
    <path d="M44 58 h28 M46 63 h24 M48 68 h20" opacity=".5" />
    <path d="M44 54 c2 -7 8 -10 14 -10 s12 3 14 10" fill="#fbf6ec" />
  </svg>
);

const Groceries = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M28 30 h64 l-8 38 H36 z" fill="#e8c99b" />
    <path d="M38 30 c0 -12 8 -18 22 -18 s22 6 22 18" />
    <path d="M28 30 h64" />
    <path d="M45 38 l-7 20 12 -7 9 7 -2 -20 z" fill="#e59a6a" />
    <path d="M49 36 l7 -9 M52 39 l9 -5" stroke="#6a9b6e" />
    <path d="M76 40 c-7 -12 2 -20 13 -18 c5 10 0 20 -13 18 z" fill="#8fbf9f" />
    <path d="M76 40 c2 -7 7 -12 13 -15" />
    <path d="M34 36 h48" opacity=".4" />
  </svg>
);

const Dishes = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <ellipse cx="60" cy="54" rx="30" ry="8" fill="#bcd6e6" />
    <circle cx="60" cy="43" r="22" fill="#fbf6ec" />
    <circle cx="60" cy="43" r="14" fill="#e8f2ea" />
    <path d="M28 22 c4 -7 11 -7 15 0 M56 15 c4 -7 11 -7 15 0 M86 22 c4 -7 11 -7 15 0" stroke="#8fbf9f" />
    <path d="M96 36 l8 -14 M102 18 l3 -5 M102 18 l3 5" stroke="#c99a64" />
  </svg>
);

const Cleaning = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M86 8 L58 44" stroke="#c99a64" strokeWidth="4" />
    <path d="M50 40 l20 10 -8 22 -20 -8 z" fill="#e8c48a" />
    <path d="M54 50 l12 6 M52 57 l12 6" opacity=".5" />
    <path d="M88 6 l6 4" />
  </svg>
);

const Cooking = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M30 36 h60 v16 c0 10 -12 16 -30 16 s-30 -6 -30 -16 z" fill="#d98e72" />
    <path d="M26 36 h68" strokeWidth="4" />
    <path d="M46 26 c0 -8 6 -8 6 -16 M60 26 c0 -8 6 -8 6 -16" stroke="#9aa8a0" />
    <path d="M36 36 v-4 M84 36 v-4" />
    <path d="M92 30 l8 -8" stroke="#c99a64" />
  </svg>
);

const Call = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M34 16 c-6 2 -9 8 -7 15 4 17 15 28 32 32 7 2 13 0 15 -6 l4 -11 -14 -7 -7 7 c-7 -4 -12 -9 -15 -16 l7 -7 -6 -14 z" fill="#8fbf9f" />
    <path d="M80 16 c9 3 16 10 19 19 M86 10 c11 4 19 12 22 23" />
  </svg>
);

const Meeting = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <rect x="22" y="16" width="76" height="48" rx="7" fill="#fbf6ec" />
    <path d="M22 30 h76" />
    <circle cx="42" cy="42" r="7" fill="#d98e72" />
    <circle cx="60" cy="42" r="7" fill="#8fbf9f" />
    <circle cx="78" cy="42" r="7" fill="#bcd6e6" />
    <path d="M33 55 c0 -7 4 -10 9 -10 s9 3 9 10 M51 55 c0 -7 4 -10 9 -10 s9 3 9 10 M69 55 c0 -7 4 -10 9 -10 s9 3 9 10" />
  </svg>
);

const Exercise = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M26 40 h68" stroke="#c99a64" strokeWidth="4" />
    <rect x="20" y="30" width="12" height="20" rx="3" fill="#d98e72" />
    <rect x="88" y="30" width="12" height="20" rx="3" fill="#d98e72" />
    <rect x="10" y="36" width="8" height="8" rx="2" fill="#bcd6e6" />
    <rect x="102" y="36" width="8" height="8" rx="2" fill="#bcd6e6" />
  </svg>
);

const Reading = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M20 18 c10 -5 22 -5 40 3 18 -8 30 -8 40 -3 v38 c-10 -5 -22 -5 -40 3 -18 -8 -30 -8 -40 -3 z" fill="#fbf6ec" />
    <path d="M60 21 v38" />
    <path d="M30 28 c8 -2 16 -2 24 2 M30 37 c8 -2 16 -2 24 2 M66 30 c8 -4 16 -4 24 -2 M66 39 c8 -4 16 -4 24 -2" stroke="#9aa8a0" />
  </svg>
);

const Plants = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M20 48 h30 v20 h-30 z" fill="#d98e72" />
    <path d="M24 48 c0 -16 8 -24 16 -24 s16 8 16 24" fill="#8fbf9f" />
    <path d="M40 48 v-20 M40 36 l-12 -8 M40 32 l12 -8" stroke="#6a9b6e" />
    <path d="M68 38 h22 v12 h-22 z" fill="#bcd6e6" />
    <path d="M90 40 l12 -6 v12 l-12 6" fill="#bcd6e6" />
    <path d="M68 38 c0 -8 6 -12 11 -12 s11 4 11 12" />
    <path d="M98 32 c4 4 6 8 6 14" />
  </svg>
);

const Bill = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M34 10 h52 v58 l-8 -4 -8 4 -8 -4 -8 4 -8 -4 -8 4 z" fill="#fbf6ec" />
    <path d="M44 22 h32 M44 32 h32 M44 42 h20" stroke="#9aa8a0" />
    <circle cx="72" cy="56" r="10" fill="#e8c48a" />
    <path d="M72 51 v10 M69 53 h6 M69 59 h6" stroke="#9a6a32" />
  </svg>
);

const Repair = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M72 12 c-12 0 -20 8 -20 20 0 4 1 7 3 10 L34 63 l9 9 21 -21 c3 2 6 3 10 3 12 0 20 -8 20 -20 0 -3 -1 -6 -2 -8 l-11 11 -9 -9 11 -11 c-3 -2 -6 -3 -9 -3 z" fill="#bcd6e6" />
  </svg>
);

const Health = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M60 68 c-18 -12 -30 -23 -30 -36 0 -9 6 -15 15 -15 7 0 12 4 15 9 3 -5 8 -9 15 -9 9 0 15 6 15 15 0 13 -12 24 -30 36 z" fill="#f3c9b8" />
    <path d="M60 31 v18 M51 40 h18" stroke="#b85c45" strokeWidth="5" />
  </svg>
);

const Travel = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <path d="M16 48 l82 -30 -20 38 -16 -8 -10 14 -3 -18 z" fill="#bcd6e6" />
    <path d="M58 46 l14 8" />
    <path d="M26 22 c10 -6 20 -10 30 -12" stroke="#9aa8a0" />
  </svg>
);

const DOODLES: Record<DoodleKind, React.FC> = {
  laundry: Laundry,
  groceries: Groceries,
  dishes: Dishes,
  cleaning: Cleaning,
  cooking: Cooking,
  call: Call,
  meeting: Meeting,
  exercise: Exercise,
  reading: Reading,
  plants: Plants,
  bill: Bill,
  repair: Repair,
  health: Health,
  travel: Travel,
};

export const Doodle: React.FC<{ kind: DoodleKind }> = ({ kind }) => {
  const Component = DOODLES[kind];
  return <Component />;
};
