import React from 'react';
import { getAtmosphere } from '../../../theme/atmosphere';

export type WeatherCondition = 'clear' | 'cloudy' | 'raining' | 'snow' | 'hailstorm';

type Period = 'night' | 'dawn' | 'day' | 'dusk';

interface WeatherPanelProps {
  minutes: number; // minutes since midnight, may be fractional while dragging
}

const DAY_MINUTES = 24 * 60;

export function getWeatherPeriod(minutes: number): Period {
  const hour = ((Math.round(minutes) / 60) % 24 + 24) % 24;
  if (hour < 6) return 'night';
  if (hour < 8) return 'dawn';
  if (hour < 18) return 'day';
  if (hour < 19) return 'dusk';
  return 'night';
}

/**
 * Dummy forecast: daytime stays clear with a sun, including 12:00 PM–2:00 PM.
 * Dawn and dusk are cloudy; snow/hail art remains available for a future API.
 */
export function getWeatherCondition(minutes: number): WeatherCondition {
  const normalized = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const period = getWeatherPeriod(normalized);
  if (period === 'dawn' || period === 'dusk') return 'cloudy';
  return 'clear';
}

/**
 * Layered gradients give the timeline a softer, more believable sky.
 * Colours come from the shared atmosphere store, so this panel follows the
 * same continuous day/night interpolation as the rest of the dashboard.
 */
export function getWeatherGradient(period: Period, condition: WeatherCondition) {
  if (condition === 'raining' || condition === 'hailstorm') {
    return [
      'radial-gradient(circle at 25% 0%, var(--atmo-haze) 0%, transparent 46%)',
      'linear-gradient(180deg, var(--atmo-rain-top) 0%, var(--atmo-rain-mid) 45%, var(--atmo-rain-low) 75%, var(--atmo-rain-low) 100%)',
    ].join(', ');
  }

  if (condition === 'snow') {
    return [
      'radial-gradient(circle at 75% 16%, rgba(255, 255, 255, 0.55) 0%, transparent 34%)',
      'var(--atmo-page)',
    ].join(', ');
  }

  if (condition === 'cloudy') {
    return [
      'radial-gradient(circle at 78% 20%, var(--atmo-haze) 0%, transparent 36%)',
      'var(--atmo-page)',
    ].join(', ');
  }

  const glowPosition = period === 'night' ? '76% 18%' : period === 'dusk' ? '82% 78%' : '74% 14%';
  return [
    `radial-gradient(circle at ${glowPosition}, var(--atmo-glow) 0%, transparent 42%)`,
    'var(--atmo-page)',
  ].join(', ');
}

function isDarkBackdrop(minutes: number, condition: WeatherCondition) {
  return condition === 'raining' || condition === 'hailstorm' || getAtmosphere(minutes).daylight < 0.62;
}

/** Full moon and exactly two tiny stars for the night sky. */
function NightSky() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <svg
        data-weather="moon"
        viewBox="0 0 120 60"
        className="absolute right-[22%] top-[10%] h-20 w-40 sm:h-24 sm:w-48"
        style={{ filter: 'drop-shadow(0 0 12px rgba(226, 232, 240, 0.45))' }}
      >
        <circle cx="30" cy="30" r="23" fill="rgba(226, 232, 240, 0.10)" />
        <circle cx="30" cy="30" r="16" fill="#f8fafc" />
        <circle cx="25" cy="24" r="3" fill="#cbd5e1" opacity="0.55" />
        <circle cx="35" cy="33" r="2.2" fill="#cbd5e1" opacity="0.5" />
        <circle cx="27" cy="37" r="1.6" fill="#cbd5e1" opacity="0.45" />
        <circle data-weather="star" cx="64" cy="13" r="1.6" fill="#dbeafe" />
        <circle data-weather="star" cx="90" cy="41" r="1.3" fill="#dbeafe" />
      </svg>
    </div>
  );
}

function WeatherArt({
  condition,
  dark,
  className,
}: {
  condition: WeatherCondition;
  dark: boolean;
  className: string;
}) {
  const cloudFill = condition === 'hailstorm'
    ? 'rgba(241, 245, 249, 0.98)'
    : dark
      ? 'rgba(226, 232, 240, 0.98)'
      : 'rgba(248, 250, 252, 0.98)';
  const cloudStroke = dark ? 'rgba(148, 163, 184, 0.65)' : 'rgba(100, 116, 139, 0.5)';

  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
      {condition === 'clear' && !dark && (
        <g data-weather-icon="sun" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 216, 77, 0.65))' }}>
          <circle cx="78" cy="38" r="24" fill="rgba(255, 230, 130, 0.25)" />
          <circle cx="78" cy="38" r="17" fill="#ffd84d" opacity="0.98" />
          <circle cx="73" cy="33" r="6" fill="#fff6bf" opacity="0.9" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x1 = 78 + Math.cos(angle) * 23;
            const y1 = 38 + Math.sin(angle) * 23;
            const x2 = 78 + Math.cos(angle) * 30;
            const y2 = 38 + Math.sin(angle) * 30;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffb703" strokeWidth="3" strokeLinecap="round" />;
          })}
        </g>
      )}
      {(condition === 'cloudy' || condition === 'raining' || condition === 'snow' || condition === 'hailstorm') && (
        <g data-weather-icon="cloud">
          {condition === 'cloudy' && !dark && <circle cx="82" cy="32" r="15" fill="#ffd84d" opacity="0.96" />}
          <path
            d="M25 62 C25 49 35 40 48 40 C54 29 70 28 78 39 C91 38 100 48 100 61 C100 72 91 78 80 78 H39 C30 78 25 71 25 62Z"
            fill={cloudFill}
            stroke={cloudStroke}
            strokeWidth="1.5"
          />
          <path
            d="M39 52 C48 44 60 44 67 49"
            fill="none"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          {condition === 'raining' && (
            <g
              data-weather-icon="rain"
              className="weather-rain"
              stroke="#7dd3fc"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.98"
              style={{ filter: 'drop-shadow(0 0 4px rgba(125, 211, 252, 0.95))' }}
            >
              <line x1="45" y1="84" x2="41" y2="98" />
              <line x1="60" y1="84" x2="56" y2="98" />
              <line x1="75" y1="84" x2="71" y2="98" />
              <line x1="90" y1="84" x2="86" y2="98" />
            </g>
          )}
          {condition === 'snow' && (
            <g data-weather-icon="snow" className="weather-snow" fill="#e2e8f0" opacity="0.96">
              <circle cx="44" cy="92" r="2.6" />
              <circle cx="59" cy="96" r="2.6" />
              <circle cx="74" cy="92" r="2.6" />
              <circle cx="89" cy="96" r="2.6" />
            </g>
          )}
          {condition === 'hailstorm' && (
            <g data-weather-icon="hail" className="weather-rain" fill="#b0becc" opacity="0.96">
              <circle cx="45" cy="92" r="3.2" />
              <circle cx="60" cy="96" r="3.2" />
              <circle cx="75" cy="92" r="3.2" />
              <circle cx="90" cy="96" r="3.2" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ minutes }) => {
  const condition = getWeatherCondition(minutes);
  const period = getWeatherPeriod(minutes);
  const dark = isDarkBackdrop(minutes, condition);
  const showNightSky = period === 'night' && (condition === 'clear' || condition === 'cloudy');

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ background: getWeatherGradient(period, condition) }}
      aria-label="Weather background"
    >
      {showNightSky && <NightSky />}

      <div className={`absolute right-[8%] top-1/2 -translate-y-1/2 ${dark ? 'opacity-[0.52]' : 'opacity-[0.58]'}`}>
        <WeatherArt condition={condition} dark={dark} className="h-36 w-56 sm:h-52 sm:w-80" />
      </div>

      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, var(--atmo-haze) 0%, transparent 55%, var(--atmo-shadow) 100%)' }}
      />
    </div>
  );
};
