import { create } from 'zustand';

interface WindowsMiniPlayerState {
  enabled: boolean;
  active: boolean;
  position: { x: number; y: number } | null;
  setEnabled: (enabled: boolean) => void;
  setActive: (active: boolean) => void;
  setPosition: (pos: { x: number; y: number }) => void;
}

const ENABLED_KEY = 'musophone:mini-player-enabled';
const POSITION_KEY = 'musophone:mini-player-pos';

function loadEnabled(): boolean {
  try {
    const raw = localStorage.getItem(ENABLED_KEY);
    return raw !== '0'; // default true
  } catch {
    return true;
  }
}

function loadPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useMiniPlayer = create<WindowsMiniPlayerState>()((set) => ({
  enabled: loadEnabled(),
  active: false,
  position: loadPosition(),
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
    } catch {}
    set({ enabled });
  },
  setActive: (active) => set({ active }),
  setPosition: (position) => {
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } catch {}
    set({ position });
  },
}));
