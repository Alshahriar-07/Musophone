import { create } from 'zustand';

export type Appearance = 'system' | 'light' | 'dark';
export type ResolvedAppearance = 'light' | 'dark';

/**
 * The accent palettes Settings offers. Each has a light cut that holds up on
 * the porcelain surface and a brighter cut for the AMOLED dark appearance.
 * Keep these values in step with the [data-accent] rules in tokens.css.
 */
export const ACCENTS = [
  { id: 'crimson', name: 'Crimson', light: '#c2173a', dark: '#ff4d67' },
  { id: 'rose', name: 'Rose', light: '#a81248', dark: '#ff5c8a' },
  { id: 'ember', name: 'Ember', light: '#a63d00', dark: '#ff8a4c' },
  { id: 'amber', name: 'Amber', light: '#8a5a00', dark: '#ffc14d' },
  { id: 'lime', name: 'Lime', light: '#456b00', dark: '#a8e05f' },
  { id: 'teal', name: 'Teal', light: '#00665f', dark: '#3fd6c4' },
  { id: 'blue', name: 'Blue', light: '#0057b8', dark: '#5aa9ff' },
  { id: 'violet', name: 'Violet', light: '#6425b5', dark: '#b38cff' },
  { id: 'graphite', name: 'Graphite', light: '#4b4b55', dark: '#b8b8c4' },
] as const;

export type Accent = (typeof ACCENTS)[number]['id'];

export const APPEARANCES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const satisfies readonly { id: Appearance; label: string }[];

const APPEARANCE_KEY = 'musophone:appearance';
const ACCENT_KEY = 'musophone:accent';

function readAppearance(): Appearance {
  try {
    const value = localStorage.getItem(APPEARANCE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    /* Storage can be unavailable in private modes; the default still works. */
  }
  return 'system';
}

function readAccent(): Accent {
  try {
    const value = localStorage.getItem(ACCENT_KEY);
    if (ACCENTS.some((accent) => accent.id === value)) return value as Accent;
  } catch {
    /* As above. */
  }
  return 'crimson';
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function resolveAppearance(appearance: Appearance): ResolvedAppearance {
  if (appearance === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return appearance;
}

/** Apply the preference to the document, before React or from Settings. */
export function applyAppearance(appearance: Appearance, accent: Accent): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const resolved = resolveAppearance(appearance);
  root.dataset.appearance = resolved;
  root.dataset.accent = accent;
  root.style.colorScheme = resolved;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = resolved === 'dark' ? '#000000' : '#f7f5f8';
}

interface AppearanceState {
  appearance: Appearance;
  accent: Accent;
  setAppearance: (appearance: Appearance) => void;
  setAccent: (accent: Accent) => void;
}

export const useAppearance = create<AppearanceState>()((set, get) => ({
  appearance: readAppearance(),
  accent: readAccent(),
  setAppearance: (appearance) => {
    applyAppearance(appearance, get().accent);
    try {
      localStorage.setItem(APPEARANCE_KEY, appearance);
    } catch {
      /* The UI still changes for this session. */
    }
    set({ appearance });
  },
  setAccent: (accent) => {
    applyAppearance(get().appearance, accent);
    try {
      localStorage.setItem(ACCENT_KEY, accent);
    } catch {
      /* The UI still changes for this session. */
    }
    set({ accent });
  },
}));

/**
 * Apply the saved preference once at startup and follow the OS while the user
 * has chosen System. The inline script in index.html does the first paint; this
 * keeps the document in step if the system appearance changes later.
 */
export function initAppearance(): void {
  const { appearance, accent } = useAppearance.getState();
  applyAppearance(appearance, accent);
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    const current = useAppearance.getState();
    if (current.appearance === 'system') applyAppearance('system', current.accent);
  });
}
