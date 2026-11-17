import React from 'react';
import type { DoodleKind } from './doodleMap';

const INK = '#3b342c';

const base = {
  fill: 'none',
  stroke: INK,
  strokeWidth: 3.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Sticker: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" {...base}>
    <rect x="6" y="4" width="108" height="72" rx="28" fill={bg} stroke="none" />
    <ellipse cx="60" cy="68" rx="30" ry="4" fill="#2f2a24" opacity=".08" stroke="none" />
    {children}
  </svg>
);

const Laundry = () => (
  <Sticker bg="#f7e7d8">
    <circle cx="28" cy="24" r="5" fill="#fff8ec" />
    <circle cx="92" cy="20" r="4" fill="#fff8ec" />
    <circle cx="84" cy="30" r="3" fill="#fff8ec" />
    <path d="M46 38 c0 -10 6 -16 14 -16 s14 6 14 16" fill="#9fd0e3" />
    <path d="M60 22 v16" />
    <path d="M40 40 c-6 -4 -8 -12 -2 -16 l6 16" fill="#9fd0e3" />
    <path d="M80 40 c6 -4 8 -12 2 -16 l-6 16" fill="#9fd0e3" />
    <path d="M42 38 c-4 -8 2 -14 8 -12 l-2 12" fill="#f4b3a0" />
    <path d="M80 38 c4 -8 -2 -14 -8 -12 l2 12" fill="#f4b3a0" />
    <path d="M30 40 h60 l-8 28 H38 z" fill="#dda96b" />
    <path d="M30 40 h60" strokeWidth="4" />
    <path d="M38 48 h44 M40 56 h40 M42 64 h36" opacity=".5" />
    <path d="M44 46 c6 -3 12 -3 18 0" stroke="#fff8ec" opacity=".5" />
  </Sticker>
);

const Groceries = () => (
  <Sticker bg="#e9f3e3">
    <path d="M28 30 h64 l-8 38 H36 z" fill="#e8c99b" />
    <path d="M38 30 c0 -12 8 -18 22 -18 s22 6 22 18" />
    <path d="M28 30 h64" />
    <path d="M45 38 l-7 20 12 -7 9 7 -2 -20 z" fill="#e59a6a" />
    <path d="M49 36 l7 -9 M52 39 l9 -5" stroke="#6a9b6e" />
    <path d="M76 40 c-7 -12 2 -20 13 -18 c5 10 0 20 -13 18 z" fill="#8fc9a1" />
    <path d="M76 40 c2 -7 7 -12 13 -15" />
    <path d="M34 36 h48" opacity=".4" />
  </Sticker>
);

const Dishes = () => (
  <Sticker bg="#e6f1f6">
    <ellipse cx="60" cy="54" rx="30" ry="8" fill="#9fd0e3" />
    <circle cx="60" cy="43" r="22" fill="#fff8ec" />
    <circle cx="60" cy="43" r="14" fill="#e8f2ea" />
    <path d="M28 22 c4 -7 11 -7 15 0 M56 15 c4 -7 11 -7 15 0 M86 22 c4 -7 11 -7 15 0" stroke="#8fc9a1" />
    <path d="M96 36 l8 -14 M102 18 l3 -5 M102 18 l3 5" stroke="#c9975e" />
  </Sticker>
);

const Cleaning = () => (
  <Sticker bg="#fbf0dc">
    <path d="M86 8 L58 44" stroke="#c9975e" strokeWidth="4" />
    <path d="M50 40 l20 10 -8 22 -20 -8 z" fill="#f4cf7a" />
    <path d="M54 50 l12 6 M52 57 l12 6" opacity=".5" />
    <path d="M88 6 l6 4" />
  </Sticker>
);

const Cooking = () => (
  <Sticker bg="#f8e6da">
    <path d="M30 36 h60 v16 c0 10 -12 16 -30 16 s-30 -6 -30 -16 z" fill="#ee9276" />
    <path d="M26 36 h68" strokeWidth="4" />
    <path d="M46 26 c0 -8 6 -8 6 -16 M60 26 c0 -8 6 -8 6 -16" stroke="#9aa8a0" />
    <path d="M36 36 v-4 M84 36 v-4" />
    <path d="M92 30 l8 -8" stroke="#c9975e" />
  </Sticker>
);

const Call = () => (
  <Sticker bg="#e8f2ea">
    <path d="M34 16 c-6 2 -9 8 -7 15 4 17 15 28 32 32 7 2 13 0 15 -6 l4 -11 -14 -7 -7 7 c-7 -4 -12 -9 -15 -16 l7 -7 -6 -14 z" fill="#8fc9a1" />
    <path d="M80 16 c9 3 16 10 19 19 M86 10 c11 4 19 12 22 23" />
  </Sticker>
);

const Meeting = () => (
  <Sticker bg="#e9eef8">
    <rect x="22" y="16" width="76" height="48" rx="7" fill="#fff8ec" />
    <path d="M22 30 h76" />
    <circle cx="42" cy="42" r="7" fill="#ee9276" />
    <circle cx="60" cy="42" r="7" fill="#8fc9a1" />
    <circle cx="78" cy="42" r="7" fill="#9fd0e3" />
    <path d="M33 55 c0 -7 4 -10 9 -10 s9 3 9 10 M51 55 c0 -7 4 -10 9 -10 s9 3 9 10 M69 55 c0 -7 4 -10 9 -10 s9 3 9 10" />
  </Sticker>
);

const Exercise = () => (
  <Sticker bg="#f6e8d8">
    <path d="M26 40 h68" stroke="#c9975e" strokeWidth="4" />
    <rect x="20" y="30" width="12" height="20" rx="3" fill="#ee9276" />
    <rect x="88" y="30" width="12" height="20" rx="3" fill="#ee9276" />
    <rect x="10" y="36" width="8" height="8" rx="2" fill="#9fd0e3" />
    <rect x="102" y="36" width="8" height="8" rx="2" fill="#9fd0e3" />
  </Sticker>
);

const Reading = () => (
  <Sticker bg="#eaf0f7">
    <path d="M20 18 c10 -5 22 -5 40 3 18 -8 30 -8 40 -3 v38 c-10 -5 -22 -5 -40 3 -18 -8 -30 -8 -40 -3 z" fill="#fff8ec" />
    <path d="M60 21 v38" />
    <path d="M30 28 c8 -2 16 -2 24 2 M30 37 c8 -2 16 -2 24 2 M66 30 c8 -4 16 -4 24 -2 M66 39 c8 -4 16 -4 24 -2" stroke="#9aa8a0" />
  </Sticker>
);

const Plants = () => (
  <Sticker bg="#e7f2e4">
    <path d="M20 48 h30 v20 h-30 z" fill="#ee9276" />
    <path d="M24 48 c0 -16 8 -24 16 -24 s16 8 16 24" fill="#8fc9a1" />
    <path d="M40 48 v-20 M40 36 l-12 -8 M40 32 l12 -8" stroke="#6a9b6e" />
    <path d="M68 38 h22 v12 h-22 z" fill="#9fd0e3" />
    <path d="M90 40 l12 -6 v12 l-12 6" fill="#9fd0e3" />
    <path d="M68 38 c0 -8 6 -12 11 -12 s11 4 11 12" />
    <path d="M98 32 c4 4 6 8 6 14" />
  </Sticker>
);

const Bill = () => (
  <Sticker bg="#fbf0dc">
    <path d="M16 26 h88 v42 H16 z" fill="#fff8ec" />
    <path d="M16 26 l44 27 44 -27" />
    <path d="M34 34 h38 v28 H34 z" fill="#f4cf7a" />
    <path d="M40 40 h24 M40 46 h18 M40 52 h12" stroke="#9a6a32" />
    <path d="M88 44 c-7 0 -10 4 -10 8 0 5 5 6 10 7 6 1 10 3 10 8 0 5 -4 8 -10 8 M88 40 v32" stroke="#3b342c" strokeWidth="3" />
    <circle cx="104" cy="62" r="7" fill="#f4cf7a" />
  </Sticker>
);

const Repair = () => (
  <Sticker bg="#e9eef8">
    <path d="M72 12 c-12 0 -20 8 -20 20 0 4 1 7 3 10 L34 63 l9 9 21 -21 c3 2 6 3 10 3 12 0 20 -8 20 -20 0 -3 -1 -6 -2 -8 l-11 11 -9 -9 11 -11 c-3 -2 -6 -3 -9 -3 z" fill="#9fd0e3" />
  </Sticker>
);

const Dentist = () => (
  <Sticker bg="#f3ecfa">
    <path d="M42 22 c-8 -6 -18 -2 -18 8 0 8 4 14 7 22 2 5 4 8 7 8 3 0 4 -4 5 -9 1 -5 2 -8 5 -8 s4 3 5 8 c1 5 2 9 5 9 3 0 5 -3 7 -8 3 -8 7 -14 7 -22 0 -10 -10 -14 -18 -8 -4 3 -8 3 -12 0 z" fill="#fff8ec" />
    <path d="M78 18 l16 10 -4 7 -16 -10 z" fill="#9fd0e3" />
    <path d="M74 22 l-4 6 M88 26 l5 3" />
    <path d="M28 14 l2 6 M25 17 h6" stroke="#8fc9a1" />
  </Sticker>
);

const Doctor = () => (
  <Sticker bg="#e6f3ee">
    <rect x="24" y="34" width="48" height="32" rx="7" fill="#8fc9a1" />
    <path d="M42 34 v-9 c0 -3 2 -5 5 -5 h8 c3 0 5 2 5 5 v9" />
    <path d="M48 43 v14 M41 50 h14" stroke="#fff8ec" strokeWidth="5" />
    <path d="M82 18 c-7 0 -11 4 -11 11 v7 c0 9 6 14 13 14 s13 -5 13 -14 v-7 c0 -7 -4 -11 -11 -11" />
    <circle cx="84" cy="54" r="7" fill="#9fd0e3" />
    <path d="M84 50 v-8" />
  </Sticker>
);

const Medicine = () => (
  <Sticker bg="#f9e9e5">
    <rect x="38" y="26" width="34" height="40" rx="6" fill="#fff8ec" />
    <rect x="42" y="14" width="26" height="12" rx="3" fill="#9fd0e3" />
    <path d="M46 42 h18 M55 33 v18" stroke="#b85c45" strokeWidth="5" />
    <circle cx="88" cy="50" r="9" fill="#f4cf7a" />
    <path d="M88 44 v12" stroke="#9a6a32" strokeWidth="3" />
    <circle cx="26" cy="54" r="6" fill="#8fc9a1" />
  </Sticker>
);

const Travel = () => (
  <Sticker bg="#e6f1f6">
    <path d="M16 48 l82 -30 -20 38 -16 -8 -10 14 -3 -18 z" fill="#9fd0e3" />
    <path d="M58 46 l14 8" />
    <path d="M26 22 c10 -6 20 -10 30 -12" stroke="#9aa8a0" />
  </Sticker>
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
  dentist: Dentist,
  doctor: Doctor,
  medicine: Medicine,
  travel: Travel,
};

export const Doodle: React.FC<{ kind: DoodleKind }> = ({ kind }) => {
  const Component = DOODLES[kind];
  return <Component />;
};
