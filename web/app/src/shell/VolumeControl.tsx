import { useEffect, useRef, useState } from 'react';
import { VolumeIcon } from '@/components/icons/Transport';
import { usePlayer } from '@/state/player';
import { nextVolumeFromWheel } from './wheelVolume';

interface VolumeControlProps {
  className?: string;
  iconSize?: number;
  open?: boolean;
  onOpen?: () => void;
}

export function VolumeControl({ className = '', iconSize = 20 }: VolumeControlProps) {
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const level = muted ? 0 : volume;

  const [isOpen, setIsOpen] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const clearTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handlePointerEnter = () => {
    clearTimer();
    setIsOpen(true);
  };

  const handlePointerLeave = () => {
    if (isInteracting) return;
    clearTimer();
    closeTimer.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 280);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    // If clicking on icon on touch or desktop, toggle slider or mute if already open
    if (!isOpen) {
      setIsOpen(true);
    } else {
      toggleMute();
    }
  };

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Dismiss on clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDownOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [isOpen]);

  // Wheel volume handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { volume, setVolume } = usePlayer.getState();
      const next = nextVolumeFromWheel(volume, e.deltaY);
      if (next === volume) return;
      e.preventDefault();
      setIsOpen(true);
      setVolume(next);
      handlePointerLeave();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Floating Popover Slider: Anchored above the volume icon, does NOT shift player bar */}
      <div
        className={`absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-[8px] bg-[#1a1b22]/95 px-3 py-2 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] border border-white/[0.08] transition-all duration-200 ease-out origin-bottom ${
          isOpen
            ? 'pointer-events-auto opacity-100 scale-100 translate-y-0'
            : 'pointer-events-none opacity-0 scale-95 translate-y-1'
        }`}
        role="region"
        aria-label="Volume level slider"
      >
        <span className="w-6 text-right text-[11px] font-semibold tabular-nums text-[#b3b3b3]">
          {Math.round(level * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={level}
          aria-label="Volume"
          tabIndex={isOpen ? 0 : -1}
          className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-[#44444c] accent-white transition-all [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md hover:accent-key"
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => {
            setIsInteracting(false);
          }}
          onChange={(e) => setVolume(Number(e.currentTarget.value))}
        />
      </div>

      {/* Standalone Volume Speaker Button */}
      <button
        type="button"
        className={`grid size-8 place-items-center rounded-full text-[#b3b3b3] transition-colors hover:text-white active:scale-95 ${className}`}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
        title={muted ? 'Unmute' : 'Volume'}
        onClick={handleIconClick}
        onFocus={() => setIsOpen(true)}
        onMouseEnter={() => setIsOpen(true)}
        onPointerEnter={() => setIsOpen(true)}
      >
        <VolumeIcon level={level} size={iconSize} />
      </button>
    </div>
  );
}

// Retain compatibility export for legacy imports if any
export const fadeForVolume = '';
