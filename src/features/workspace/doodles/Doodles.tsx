import React from 'react';
import type { DoodleKind } from './doodleMap';

export type DoodleStyle = 'professional' | 'cartoon' | 'doodle';

const CARTOON_ASSETS: Record<DoodleKind, string> = {
  laundry: 'laundry.svg',
  groceries: 'groceries.svg',
  dishes: 'dishes.svg',
  dentist: 'dentist.png',
  doctor: 'doctor.svg',
  medicine: 'medicine.svg',
  cleaning: 'cleaning.svg',
  cooking: 'cooking.svg',
  call: 'call.svg',
  meeting: 'meeting.svg',
  run: 'run.svg',
  exercise: 'exercise.svg',
  reading: 'reading.svg',
  plants: 'plants.svg',
  car: 'car.svg',
  heatpump: 'heatpump.png',
  washer: 'washer.png',
  bill: 'bill.svg',
  repair: 'repair.svg',
  travel: 'travel.svg',
};

// Dedicated, higher-quality images for high-priority tasks where we have one.
const PROFESSIONAL_ASSETS: Partial<Record<DoodleKind, string>> = {
  laundry: 'laundry-pro.jpg',
  dentist: 'dentist.png',
  heatpump: 'heatpump.png',
  washer: 'washer.png',
};

const BASE = import.meta.env.BASE_URL || '/';
const PHOTO_FALLBACK: DoodleKind[] = ['heatpump', 'washer'];

export const Doodle: React.FC<{ kind: DoodleKind; style?: DoodleStyle }> = ({
  kind,
  style = 'cartoon',
}) => {
  if (style === 'professional' && PROFESSIONAL_ASSETS[kind]) {
    return (
      <img
        src={`${BASE}doodles/${PROFESSIONAL_ASSETS[kind]}`}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const useCartoon =
    style === 'cartoon' ||
    style === 'professional' ||
    (style === 'doodle' && PHOTO_FALLBACK.includes(kind));
  const source = useCartoon
    ? `${BASE}doodles/${CARTOON_ASSETS[kind]}`
    : `${BASE}doodles/doodle/${kind}.svg`;

  return (
    <img
      src={source}
      alt=""
      className={`w-full h-full object-contain ${useCartoon ? 'mix-blend-multiply' : ''}`}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  );
};
