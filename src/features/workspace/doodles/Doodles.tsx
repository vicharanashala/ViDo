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
  walking: 'walking.svg',
  run: 'run.svg',
  exercise: 'exercise.svg',
  cricket: 'cricket.svg',
  football: 'football.svg',
  basketball: 'basketball.svg',
  tennis: 'tennis.svg',
  badminton: 'badminton.svg',
  volleyball: 'volleyball.svg',
  swimming: 'swimming.svg',
  cycling: 'cycling.svg',
  hockey: 'hockey.svg',
  baseball: 'baseball.svg',
  tabletennis: 'tabletennis.svg',
  boxing: 'boxing.svg',
  golf: 'golf.svg',
  sport: 'sport.svg',
  reading: 'reading.svg',
  writing: 'memo.svg',
  plants: 'plants.svg',
  car: 'car.svg',
  heatpump: 'heatpump.png',
  washer: 'washer.png',
  bill: 'bill.svg',
  project: 'project.svg',
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

const WashBasket: React.FC<{ kind: 'laundry' | 'dishes' }> = ({ kind }) => (
  <span className="relative block w-full h-full">
    <img
      src={`${BASE}doodles/laundry.svg`}
      alt=""
      className="absolute inset-0 w-full h-full object-contain"
      loading="lazy"
      decoding="async"
    />
    {kind === 'laundry' ? (
      <>
        <img
          src={`${BASE}doodles/shirt.svg`}
          alt=""
          className="absolute left-[16%] top-[2%] w-[46%] h-[52%] object-contain"
          loading="lazy"
          decoding="async"
        />
        <img
          src={`${BASE}doodles/socks.svg`}
          alt=""
          className="absolute right-[12%] top-[10%] w-[32%] h-[44%] object-contain"
          loading="lazy"
          decoding="async"
        />
      </>
    ) : (
      <>
        <img
          src={`${BASE}doodles/plate.svg`}
          alt=""
          className="absolute left-[8%] top-[0%] w-[52%] h-[55%] object-contain"
          loading="lazy"
          decoding="async"
        />
        <img
          src={`${BASE}doodles/cup.svg`}
          alt=""
          className="absolute right-[8%] top-[8%] w-[36%] h-[45%] object-contain"
          loading="lazy"
          decoding="async"
        />
      </>
    )}
  </span>
);

const ProjectDoodle: React.FC = () => (
  <span className="relative block w-full h-full">
    <img
      src={`${BASE}doodles/project.svg`}
      alt=""
      className="absolute inset-0 w-full h-full object-contain"
      loading="lazy"
      decoding="async"
    />
    <img
      src={`${BASE}doodles/memo.svg`}
      alt=""
      className="absolute right-[4%] bottom-[3%] w-[34%] h-[28%] object-contain"
      loading="lazy"
      decoding="async"
    />
    <img
      src={`${BASE}doodles/pencil.svg`}
      alt=""
      className="absolute right-[1%] bottom-[1%] w-[30%] h-[22%] object-contain rotate-12"
      loading="lazy"
      decoding="async"
    />
  </span>
);

const WritingDoodle: React.FC = () => (
  <span className="relative block w-full h-full">
    <img
      src={`${BASE}doodles/memo.svg`}
      alt=""
      className="absolute left-[4%] top-[4%] w-[82%] h-[86%] object-contain"
      loading="lazy"
      decoding="async"
    />
    <img
      src={`${BASE}doodles/pencil.svg`}
      alt=""
      className="absolute right-[0%] bottom-[0%] w-[46%] h-[34%] object-contain rotate-12"
      loading="lazy"
      decoding="async"
    />
  </span>
);

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
        loading="lazy"
        decoding="async"
      />
    );
  }

  if ((kind === 'laundry' || kind === 'dishes') && style !== 'doodle') {
    return <WashBasket kind={kind} />;
  }

  if (kind === 'project' && style !== 'doodle') {
    return <ProjectDoodle />;
  }

  if (kind === 'writing') {
    return <WritingDoodle />;
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
      loading="lazy"
      decoding="async"
    />
  );
};
