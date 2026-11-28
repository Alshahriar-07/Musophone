import { create } from 'zustand';

export type Appearance = 'dark';
export type ResolvedAppearance = 'dark';

/**
 * The accent palettes Settings offers.
 * Graphite is the default accent color for new installations.
 */
export const ACCENTS = [
  { id: 'graphite', name: 'Graphite', light: '#4b4b55', dark: '#b8b8c4' },
  { id: 'crimson', name: 'Crimson', light: '#c2173a', dark: '#ff4d67' },
  { id: 'rose', name: 'Rose', light: '#a81248', dark: '#ff5c8a' },
  { id: 'ember', name: 'Ember', light: '#a63d00', dark: '#ff8a4c' },
  { id: 'amber', name: 'Amber', light: '#8a5a00', dark: '#ffc14d' },
  { id: 'lime', name: 'Lime', light: '#456b00', dark: '#a8e05f' },
  { id: 'teal', name: 'Teal', light: '#00665f', dark: '#3fd6c4' },
  { id: 'blue', name: 'Blue', light: '#0057b8', dark: '#5aa9ff' },
  { id: 'violet', name: 'Violet', light: '#6425b5', dark: '#b38cff' },
] as const;

export type Accent = (typeof ACCENTS)[number]['id'];

const ACCENT_KEY = 'musophone:accent';

function readAccent(): Accent {
  try {
    const value = localStorage.getItem(ACCENT_KEY);
    if (ACCENTS.some((accent) => accent.id === value)) return value as Accent;
  } catch {
    /* Storage can be unavailable in private modes; default still works. */
  }
  return 'graphite';
}

export function resolveAppearance(): ResolvedAppearance {
  return 'dark';
}

/** Apply dark appearance and chosen accent to the document */
export function applyAppearance(_appearance: Appearance = 'dark', accent: Accent = readAccent()): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.appearance = 'dark';
  root.dataset.accent = accent;
  root.style.colorScheme = 'dark';
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = '#0e0f12';
}

interface AppearanceState {
  appearance: Appearance;
  accent: Accent;
  setAppearance: (appearance: Appearance) => void;
  setAccent: (accent: Accent) => void;
}

export const useAppearance = create<AppearanceState>()((set, get) => ({
  appearance: 'dark',
  accent: readAccent(),
  setAppearance: () => {
    applyAppearance('dark', get().accent);
    set({ appearance: 'dark' });
  },
  setAccent: (accent) => {
    applyAppearance('dark', accent);
    try {
      localStorage.setItem(ACCENT_KEY, accent);
    } catch {
      /* The UI still changes for this session. */
    }
    set({ accent });
  },
}));

export function initAppearance(): void {
  applyAppearance('dark', readAccent());
}

if (typeof window !== 'undefined') {
  initAppearance();
}
