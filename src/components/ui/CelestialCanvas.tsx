import React from 'react';
import { useTheme } from '../../lib/theme';

const BirdSilhouette: React.FC<{
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  'data-testid'?: string;
}> = ({ className = '', width = 28, height = 16, style, 'data-testid': testId }) => (
  <svg
    viewBox="0 0 32 18"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    className={`pointer-events-none select-none ${className}`}
    style={style}
    data-testid={testId}
  >
    <path d="M 1 10 Q 8 2 16 9 Q 24 2 31 10 Q 24 4 16 11 Q 8 4 1 10 Z" />
  </svg>
);

const LeafSilhouette: React.FC<{
  className?: string;
  size?: number;
  style?: React.CSSProperties;
  'data-testid'?: string;
}> = ({ className = '', size = 20, style, 'data-testid': testId }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={`pointer-events-none select-none ${className}`}
    style={style}
    data-testid={testId}
  >
    <path d="M 2 20 C 3 13, 8 6, 21 3 C 21 10, 16 17, 3 21 Z" />
    <path d="M 3 21 C 9 16, 14 11, 20 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
  </svg>
);

interface LeafParticle {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  animation: string;
  color: string;
}

const DAY_LEAVES: LeafParticle[] = [
  { id: 1, left: '8%', size: 20, duration: '22s', delay: '-3s', animation: 'animate-leaf-sway-1', color: 'text-amber-500/40' },
  { id: 2, left: '18%', size: 16, duration: '26s', delay: '-8s', animation: 'animate-leaf-sway-2', color: 'text-emerald-500/35' },
  { id: 3, left: '28%', size: 22, duration: '24s', delay: '-14s', animation: 'animate-leaf-sway-3', color: 'text-lime-600/35' },
  { id: 4, left: '38%', size: 18, duration: '28s', delay: '-5s', animation: 'animate-leaf-sway-4', color: 'text-amber-600/45' },
  { id: 5, left: '48%', size: 24, duration: '21s', delay: '-11s', animation: 'animate-leaf-sway-5', color: 'text-emerald-600/35' },
  { id: 6, left: '58%', size: 17, duration: '25s', delay: '-17s', animation: 'animate-leaf-sway-1', color: 'text-yellow-600/40' },
  { id: 7, left: '68%', size: 21, duration: '23s', delay: '-7s', animation: 'animate-leaf-sway-2', color: 'text-lime-500/35' },
  { id: 8, left: '78%', size: 19, duration: '27s', delay: '-13s', animation: 'animate-leaf-sway-3', color: 'text-amber-500/45' },
  { id: 9, left: '88%', size: 23, duration: '22s', delay: '-4s', animation: 'animate-leaf-sway-4', color: 'text-emerald-500/35' },
  { id: 10, left: '12%', size: 18, duration: '29s', delay: '-18s', animation: 'animate-leaf-sway-5', color: 'text-yellow-500/40' },
  { id: 11, left: '32%', size: 20, duration: '24s', delay: '-9s', animation: 'animate-leaf-sway-1', color: 'text-lime-600/35' },
  { id: 12, left: '52%', size: 15, duration: '26s', delay: '-15s', animation: 'animate-leaf-sway-2', color: 'text-amber-600/40' },
  { id: 13, left: '72%', size: 22, duration: '23s', delay: '-2s', animation: 'animate-leaf-sway-3', color: 'text-emerald-600/35' },
  { id: 14, left: '84%', size: 18, duration: '27s', delay: '-12s', animation: 'animate-leaf-sway-4', color: 'text-yellow-600/35' },
  { id: 15, left: '94%', size: 20, duration: '25s', delay: '-6s', animation: 'animate-leaf-sway-5', color: 'text-amber-500/40' },
  { id: 16, left: '44%', size: 16, duration: '28s', delay: '-20s', animation: 'animate-leaf-sway-2', color: 'text-lime-500/35' },
];

interface NightParticle {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  animation: string;
  glow: string;
}

const NIGHT_PARTICLES: NightParticle[] = [
  { id: 1, top: '8%', left: '12%', size: 3.5, duration: '14s', delay: '-2s', animation: 'animate-particle-drift-1', glow: '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(56,189,248,0.5)' },
  { id: 2, top: '15%', left: '28%', size: 2.5, duration: '18s', delay: '-5s', animation: 'animate-particle-drift-2', glow: '0 0 8px 2px rgba(255,255,255,0.85), 0 0 16px 3px rgba(186,230,253,0.4)' },
  { id: 3, top: '22%', left: '7%', size: 4, duration: '22s', delay: '-8s', animation: 'animate-particle-drift-3', glow: '0 0 12px 3px rgba(255,255,255,0.95), 0 0 24px 6px rgba(56,189,248,0.6)' },
  { id: 4, top: '10%', left: '48%', size: 2, duration: '16s', delay: '-11s', animation: 'animate-particle-drift-4', glow: '0 0 6px 1px rgba(255,255,255,0.8)' },
  { id: 5, top: '18%', left: '65%', size: 3, duration: '20s', delay: '-4s', animation: 'animate-particle-drift-5', glow: '0 0 9px 2px rgba(255,255,255,0.9), 0 0 18px 4px rgba(56,189,248,0.4)' },
  { id: 6, top: '27%', left: '38%', size: 2.5, duration: '15s', delay: '-1s', animation: 'animate-particle-drift-1', glow: '0 0 7px 2px rgba(255,255,255,0.85)' },
  { id: 7, top: '33%', left: '18%', size: 4.5, duration: '24s', delay: '-7s', animation: 'animate-particle-drift-2', glow: '0 0 14px 3px rgba(255,255,255,1), 0 0 26px 6px rgba(147,197,253,0.6)' },
  { id: 8, top: '38%', left: '52%', size: 2, duration: '19s', delay: '-13s', animation: 'animate-particle-drift-3', glow: '0 0 6px 1px rgba(255,255,255,0.75)' },
  { id: 9, top: '44%', left: '8%', size: 3, duration: '17s', delay: '-3s', animation: 'animate-particle-drift-4', glow: '0 0 8px 2px rgba(255,255,255,0.85), 0 0 16px 3px rgba(56,189,248,0.4)' },
  { id: 10, top: '48%', left: '30%', size: 3.5, duration: '21s', delay: '-9s', animation: 'animate-particle-drift-5', glow: '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(56,189,248,0.5)' },
  { id: 11, top: '55%', left: '44%', size: 2.5, duration: '16s', delay: '-6s', animation: 'animate-particle-drift-1', glow: '0 0 7px 2px rgba(255,255,255,0.8)' },
  { id: 12, top: '58%', left: '72%', size: 4, duration: '23s', delay: '-12s', animation: 'animate-particle-drift-2', glow: '0 0 12px 3px rgba(255,255,255,0.95), 0 0 22px 5px rgba(56,189,248,0.5)' },
  { id: 13, top: '62%', left: '15%', size: 2, duration: '13s', delay: '-4s', animation: 'animate-particle-drift-3', glow: '0 0 6px 1px rgba(255,255,255,0.75)' },
  { id: 14, top: '68%', left: '35%', size: 3.5, duration: '25s', delay: '-15s', animation: 'animate-particle-drift-4', glow: '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(186,230,253,0.5)' },
  { id: 15, top: '72%', left: '58%', size: 2.5, duration: '17s', delay: '-2s', animation: 'animate-particle-drift-5', glow: '0 0 8px 2px rgba(255,255,255,0.85)' },
  { id: 16, top: '78%', left: '22%', size: 4, duration: '20s', delay: '-10s', animation: 'animate-particle-drift-1', glow: '0 0 12px 3px rgba(255,255,255,0.95), 0 0 24px 5px rgba(56,189,248,0.5)' },
  { id: 17, top: '82%', left: '48%', size: 2, duration: '15s', delay: '-5s', animation: 'animate-particle-drift-2', glow: '0 0 6px 1px rgba(255,255,255,0.8)' },
  { id: 18, top: '86%', left: '10%', size: 3, duration: '22s', delay: '-14s', animation: 'animate-particle-drift-3', glow: '0 0 9px 2px rgba(255,255,255,0.9), 0 0 18px 4px rgba(56,189,248,0.4)' },
  { id: 19, top: '89%', left: '38%', size: 2.5, duration: '18s', delay: '-7s', animation: 'animate-particle-drift-4', glow: '0 0 8px 2px rgba(255,255,255,0.85)' },
  { id: 20, top: '92%', left: '68%', size: 3.5, duration: '26s', delay: '-16s', animation: 'animate-particle-drift-5', glow: '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(56,189,248,0.5)' },
  { id: 21, top: '14%', left: '82%', size: 2.5, duration: '19s', delay: '-3s', animation: 'animate-particle-drift-1', glow: '0 0 8px 2px rgba(255,255,255,0.85)' },
  { id: 22, top: '25%', left: '90%', size: 3, duration: '21s', delay: '-9s', animation: 'animate-particle-drift-2', glow: '0 0 9px 2px rgba(255,255,255,0.9), 0 0 18px 4px rgba(56,189,248,0.4)' },
  { id: 23, top: '36%', left: '80%', size: 4, duration: '24s', delay: '-11s', animation: 'animate-particle-drift-3', glow: '0 0 12px 3px rgba(255,255,255,0.95), 0 0 22px 5px rgba(186,230,253,0.5)' },
  { id: 24, top: '46%', left: '92%', size: 2, duration: '14s', delay: '-1s', animation: 'animate-particle-drift-4', glow: '0 0 6px 1px rgba(255,255,255,0.75)' },
  { id: 25, top: '56%', left: '86%', size: 3.5, duration: '23s', delay: '-8s', animation: 'animate-particle-drift-5', glow: '0 0 11px 3px rgba(255,255,255,0.9), 0 0 20px 4px rgba(56,189,248,0.4)' },
  { id: 26, top: '69%', left: '82%', size: 2.5, duration: '17s', delay: '-13s', animation: 'animate-particle-drift-1', glow: '0 0 8px 2px rgba(255,255,255,0.85)' },
  { id: 27, top: '80%', left: '88%', size: 3, duration: '20s', delay: '-4s', animation: 'animate-particle-drift-2', glow: '0 0 9px 2px rgba(255,255,255,0.9), 0 0 18px 4px rgba(56,189,248,0.4)' },
  { id: 28, top: '91%', left: '85%', size: 2, duration: '16s', delay: '-6s', animation: 'animate-particle-drift-3', glow: '0 0 6px 1px rgba(255,255,255,0.8)' },
  { id: 29, top: '5%', left: '34%', size: 3, duration: '22s', delay: '-12s', animation: 'animate-particle-drift-4', glow: '0 0 9px 2px rgba(255,255,255,0.9), 0 0 18px 4px rgba(186,230,253,0.4)' },
  { id: 30, top: '52%', left: '2%', size: 3.5, duration: '25s', delay: '-10s', animation: 'animate-particle-drift-5', glow: '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(56,189,248,0.5)' },
];

export interface CelestialCanvasProps {
  className?: string;
  children?: React.ReactNode;
  /**
   * Explicit theme mode override if needed, otherwise reflects active theme context.
   */
  mode?: 'light' | 'evening' | 'dark';
}

export const CelestialCanvas: React.FC<CelestialCanvasProps> = ({
  className = '',
  children,
  mode: propMode,
}) => {
  const { resolvedTheme } = useTheme();
  const effectiveMode = propMode ?? resolvedTheme;
  const isLight = effectiveMode === 'light';
  const isEvening = effectiveMode === 'evening';
  const isDark = effectiveMode === 'dark';

  return (
    <div
      data-testid="celestial-canvas"
      aria-hidden="true"
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-700 bg-[var(--canvas-gradient)] ${className}`}
    >
      {/* Light Mode: Radiant Sun & Dawn Horizon */}
      <div
        data-testid="celestial-sun"
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isLight ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Soft Golden Morning Horizon Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140vw] h-[65vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300/35 via-sky-200/25 to-transparent blur-3xl pointer-events-none" />

        {/* Sun Disc & Corona */}
        <div className="absolute top-[8%] right-[15%] sm:right-[18%] w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-amber-400/80 via-yellow-200/90 to-amber-100 blur-xl opacity-80 animate-pulse [animation-duration:8s] pointer-events-none" />
        <div className="absolute top-[10%] right-[17%] sm:right-[20%] w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-yellow-100 to-amber-400 shadow-[0_0_90px_rgba(245,158,11,0.6)] pointer-events-none" />

        {/* Swaying Leaf Particles for Day Theme */}
        <div data-testid="day-leaf-particles" className="absolute inset-0 pointer-events-none overflow-hidden">
          {DAY_LEAVES.map((leaf) => (
            <div
              key={leaf.id}
              className={`absolute top-0 ${leaf.animation} ${leaf.color} pointer-events-none will-change-transform`}
              style={{
                left: leaf.left,
                animationDuration: leaf.duration,
                animationDelay: leaf.delay,
              }}
            >
              <LeafSilhouette size={leaf.size} data-testid={`leaf-${leaf.id}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Evening Mode: Sunset Horizon with Radiant Reddish / Crimson Atmosphere */}
      <div
        data-testid="celestial-evening"
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isEvening ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Deep Fiery Reddish Sunset Glow */}
        <div className="absolute top-0 right-0 w-[100vw] sm:w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-600/40 via-red-950/45 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-[8%] right-[12%] w-[550px] h-[550px] bg-rose-600/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-[45vh] bg-gradient-to-t from-[#14050b] via-rose-950/20 to-transparent pointer-events-none" />

        {/* Setting Sun Aura & Sinking Disc */}
        <div className="absolute top-[12%] right-[15%] sm:right-[18%] w-52 h-52 sm:w-68 sm:h-68 rounded-full bg-gradient-to-br from-rose-500/40 via-red-600/30 to-amber-500/10 blur-2xl opacity-90 shadow-[0_0_130px_rgba(244,63,94,0.7)] pointer-events-none" />
        <div className="absolute top-[14%] right-[17%] sm:right-[20%] w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-rose-600 via-rose-400 to-amber-200 shadow-[0_0_90px_rgba(244,63,94,0.8),_0_0_35px_rgba(251,113,133,0.9)] pointer-events-none">
          {/* Subtle Horizon Haze across Lower Half of Sun Disc */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#14050b]/80 to-transparent blur-xs rounded-b-full pointer-events-none" />
        </div>

        {/* Early Twilight Glimmer Stars */}
        <div className="absolute top-[8%] left-[15%] w-1.5 h-1.5 rounded-full bg-rose-200/80 shadow-[0_0_8px_#f43f5e] animate-ping [animation-duration:4s]" />
        <div className="absolute top-[18%] left-[32%] w-1 h-1 rounded-full bg-amber-200/70 shadow-[0_0_5px_#fbbf24]" />
        <div className="absolute top-[12%] left-[60%] w-1.5 h-1.5 rounded-full bg-rose-300/70 shadow-[0_0_6px_#fda4af]" />
        <div className="absolute top-[26%] left-[45%] w-1 h-1 rounded-full bg-white/60" />

        {/* Silhouetted Birds Gliding across Sunrise & Sunset Horizon */}
        <div data-testid="celestial-birds" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[18%] left-0 animate-bird-glide-1">
            <div className="animate-bird-flap text-[#4c0d1e]/80 dark:text-rose-200/70 drop-shadow-[0_2px_4px_rgba(244,63,94,0.3)]">
              <BirdSilhouette width={26} height={15} data-testid="bird-1" />
            </div>
          </div>
          <div className="absolute top-[22%] left-0 animate-bird-glide-2">
            <div className="animate-bird-flap [animation-duration:1.4s] text-[#4c0d1e]/75 dark:text-rose-200/65 drop-shadow-[0_2px_4px_rgba(244,63,94,0.25)]">
              <BirdSilhouette width={22} height={13} data-testid="bird-2" />
            </div>
          </div>
          <div className="absolute top-[15%] left-0 animate-bird-glide-3">
            <div className="animate-bird-flap [animation-duration:1.1s] text-[#4c0d1e]/70 dark:text-rose-300/60 drop-shadow-[0_2px_4px_rgba(244,63,94,0.25)]">
              <BirdSilhouette width={18} height={11} data-testid="bird-3" />
            </div>
          </div>
          <div className="absolute top-[26%] left-0 animate-bird-glide-4">
            <div className="animate-bird-flap [animation-duration:1.5s] text-[#4c0d1e]/75 dark:text-rose-200/65 drop-shadow-[0_2px_4px_rgba(244,63,94,0.25)]">
              <BirdSilhouette width={20} height={12} data-testid="bird-4" />
            </div>
          </div>
          <div className="absolute top-[20%] left-0 animate-bird-glide-5">
            <div className="animate-bird-flap [animation-duration:1.3s] text-[#4c0d1e]/65 dark:text-rose-300/55">
              <BirdSilhouette width={15} height={9} data-testid="bird-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Dark Mode: Cosmic Moon & Radiant Bluish Glow */}
      <div
        data-testid="celestial-moon"
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Deep Luminous Bluish Nebula Glow */}
        <div className="absolute top-0 right-0 w-[90vw] sm:w-[70vw] h-[75vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-indigo-900/35 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Ambient Moon Aura & Disc */}
        <div className="absolute top-[8%] right-[15%] sm:right-[18%] w-52 h-52 sm:w-68 sm:h-68 rounded-full bg-gradient-to-br from-sky-400/30 via-blue-600/25 to-indigo-950/0 blur-2xl opacity-90 shadow-[0_0_120px_rgba(56,189,248,0.4)] pointer-events-none" />
        <div className="absolute top-[10%] right-[17%] sm:right-[20%] w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-slate-100 via-sky-100 to-indigo-100 shadow-[0_0_70px_rgba(56,189,248,0.5),_0_0_25px_rgba(255,255,255,0.7)] pointer-events-none">
          {/* Subtle Moon Crater / Crescent Shadow */}
          <div className="absolute -top-1 -right-1 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#030712]/90 blur-[1px] pointer-events-none" />
        </div>

        {/* Twinkling Starlight Field */}
        <div className="absolute top-[6%] left-[12%] w-1.5 h-1.5 rounded-full bg-sky-200/80 shadow-[0_0_8px_#38bdf8] animate-ping [animation-duration:5s]" />
        <div className="absolute top-[15%] left-[28%] w-1 h-1 rounded-full bg-white/70 shadow-[0_0_4px_white]" />
        <div className="absolute top-[10%] left-[55%] w-1.5 h-1.5 rounded-full bg-blue-200/70 shadow-[0_0_6px_#60a5fa]" />
        <div className="absolute top-[24%] left-[40%] w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute top-[28%] right-[32%] w-1.5 h-1.5 rounded-full bg-sky-300/70 shadow-[0_0_6px_#38bdf8]" />
        <div className="absolute top-[35%] left-[18%] w-1 h-1 rounded-full bg-indigo-200/60" />
        <div className="absolute top-[42%] right-[22%] w-1 h-1 rounded-full bg-white/50" />

        {/* White Glowing Randomly Moving Cosmic Particles for Night Theme */}
        <div
          data-testid="night-glowing-particles"
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          {NIGHT_PARTICLES.map((particle) => (
            <div
              key={particle.id}
              data-testid={`night-particle-${particle.id}`}
              className={`absolute rounded-full bg-white pointer-events-none will-change-transform ${particle.animation}`}
              style={{
                top: particle.top,
                left: particle.left,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: particle.glow,
                animationDuration: particle.duration,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      </div>

      {children}
    </div>
  );
};
