// @vitest-environment happy-dom
import { QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { TrackLockup } from '@/components/music/Lockups';
import { SearchField } from '@/components/music/SearchField';
import { TrackList } from '@/components/music/TrackList';
import type { MusicItem, Track } from '@/data/music/types';
import { queryClient } from '@/lib/queryClient';
import { PlayerBar } from '@/shell/PlayerBar';
import { Sidebar } from '@/shell/Sidebar';
import { useUi } from '@/state/ui';

// Configure IS_REACT_ACT_ENVIRONMENT for React 19 testing in happy-dom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('UI & Interaction Fixes', () => {
  it('makes the entire song row in TrackLockup clickable and triggers onPlay', async () => {
    const playMock = vi.fn();
    const item: MusicItem = {
      kind: 'song',
      id: 'test-song-1',
      title: 'Bohemian Rhapsody',
      subtitle: 'Queen',
      artists: [{ id: 'queen-id', name: 'Queen' }],
      album: { id: 'album-id', name: 'A Night at the Opera' },
      thumbnail: 'https://example.com/thumb.jpg',
      wide: false,
      durationSec: 354,
      explicit: false,
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <TrackLockup item={item} onPlay={playMock} />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const row = container.querySelector('.group\\/track') as HTMLElement;
    expect(row).not.toBeNull();
    expect(row.classList.contains('cursor-pointer')).toBe(true);

    // Clicking anywhere in the row triggers onPlay
    await act(async () => {
      row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(playMock).toHaveBeenCalledTimes(1);

    // Clicking the title area triggers onPlay
    const titleSpan = row.querySelector('.type-\\[600_12\\.5px\\/16px\\] span') as HTMLElement;
    expect(titleSpan).not.toBeNull();
    await act(async () => {
      titleSpan.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(playMock).toHaveBeenCalledTimes(2);

    root.unmount();
    document.body.removeChild(container);
  });

  it('prevents nested TrackMenu button clicks from triggering row playback in TrackLockup', async () => {
    const playMock = vi.fn();
    const item: MusicItem = {
      kind: 'song',
      id: 'test-song-2',
      title: 'Starman',
      subtitle: 'David Bowie',
      artists: [{ id: 'bowie-id', name: 'David Bowie' }],
      album: { id: 'album-bowie', name: 'Ziggy Stardust' },
      thumbnail: 'https://example.com/starman.jpg',
      wide: false,
      durationSec: 250,
      explicit: false,
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <TrackLockup item={item} onPlay={playMock} />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const row = container.querySelector('.group\\/track') as HTMLElement;
    const menuButton = row.querySelector('button[data-track-menu]') as HTMLButtonElement;
    expect(menuButton).not.toBeNull();

    // Clicking the track menu button should NOT trigger playback
    await act(async () => {
      menuButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(playMock).not.toHaveBeenCalled();

    root.unmount();
    document.body.removeChild(container);
  });

  it('renders TrackList row with full clickable row and cursor-pointer', async () => {
    const tracks: Track[] = [
      {
        videoId: 'vid-1',
        title: 'Song in Album',
        artists: [{ id: 'art-1', name: 'Artist 1' }],
        album: { id: 'alb-1', name: 'Album 1' },
        thumbnail: 'https://example.com/art.jpg',
        durationSec: 200,
        explicit: false,
        unavailable: undefined,
        index: 1,
        plays: null,
      },
    ];

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <TrackList tracks={tracks} variant="playlist" />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const row = container.querySelector('.group\\/row') as HTMLElement;
    expect(row).not.toBeNull();
    expect(row.classList.contains('cursor-pointer')).toBe(true);

    root.unmount();
    document.body.removeChild(container);
  });

  it('keeps Sidebar full-height and preserves Settings button when collapsed or expanded', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    // Test expanded sidebar
    act(() => {
      useUi.setState({ sidebarCollapsed: false });
    });

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <Sidebar />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const nav = container.querySelector('nav.rail') as HTMLElement;
    expect(nav).not.toBeNull();
    expect(nav.classList.contains('h-full')).toBe(true);

    let settingsLink = container.querySelector('a[href="/settings"]') as HTMLAnchorElement;
    expect(settingsLink).not.toBeNull();
    expect(settingsLink.getAttribute('aria-label')).toBe('Settings');

    // Test collapsed sidebar
    await act(async () => {
      useUi.setState({ sidebarCollapsed: true });
    });

    expect(nav.getAttribute('data-collapsed')).toBe('true');
    settingsLink = container.querySelector('a[href="/settings"]') as HTMLAnchorElement;
    // Settings link remains accessible in collapsed sidebar
    expect(settingsLink).not.toBeNull();

    // The collapsed logo expand button is accessible and clicking it restores sidebar
    const expandBtn = container.querySelector('button[aria-label="Expand sidebar"]') as HTMLButtonElement;
    expect(expandBtn).not.toBeNull();
    await act(async () => {
      expandBtn.click();
    });
    expect(useUi.getState().sidebarCollapsed).toBe(false);

    root.unmount();
    document.body.removeChild(container);
  });

  it('keeps PlayerBar accessible with Lyrics, Up Next (queue), and controls', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <PlayerBar />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const playerRegion = container.querySelector('[role="region"][aria-label="Player"]') as HTMLElement;
    expect(playerRegion).not.toBeNull();

    // Check lyrics button
    const lyricsBtn = container.querySelector('button[aria-label="Lyrics"]') as HTMLButtonElement;
    expect(lyricsBtn).not.toBeNull();

    // Check queue / Up Next button (must not be hidden)
    const upNextBtn = container.querySelector('button[aria-label="Up Next"]') as HTMLButtonElement;
    expect(upNextBtn).not.toBeNull();

    // Check play button
    const playBtn = container.querySelector('button[aria-label="Play"], button[aria-label="Pause"]') as HTMLButtonElement;
    expect(playBtn).not.toBeNull();

    root.unmount();
    document.body.removeChild(container);
  });

  it('provides real SearchField with focus, clear button, and combobox semantics', async () => {
    const onSearchMock = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <SearchField initial="Coldplay" compact onSearch={onSearchMock} />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const searchInput = container.querySelector('input[type="search"]') as HTMLInputElement;
    expect(searchInput).not.toBeNull();
    expect(searchInput.getAttribute('role')).toBe('combobox');
    expect(searchInput.getAttribute('placeholder')).toBe('Search music…');
    expect(searchInput.value).toBe('Coldplay');

    // Clear button appears when initial query is present
    const clearButton = container.querySelector('button[aria-label="Clear search"]') as HTMLButtonElement;
    expect(clearButton).not.toBeNull();

    // Clicking clear clears the field and calls onSearch('')
    await act(async () => {
      clearButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(searchInput.value).toBe('');
    expect(onSearchMock).toHaveBeenCalledWith('');

    root.unmount();
    document.body.removeChild(container);
  });

  it('renders smart floating volume slider popover on hover or focus', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <PlayerBar />
          </QueryClientProvider>
        </MemoryRouter>,
      );
    });

    const volBtn = container.querySelector('button[aria-label="Volume"], button[aria-label="Mute"]') as HTMLButtonElement;
    expect(volBtn).not.toBeNull();

    // The floating slider popover exists
    const sliderRegion = container.querySelector('[role="region"][aria-label="Volume level slider"]') as HTMLElement;
    expect(sliderRegion).not.toBeNull();
    // Default closed (opacity-0)
    expect(sliderRegion.className).toContain('opacity-0');

    // Trigger hover/pointerEnter on the volume control button
    await act(async () => {
      volBtn.dispatchEvent(new MouseEvent('pointerenter', { bubbles: true }));
      volBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      volBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Becomes visible with opacity-100
    expect(sliderRegion.className).toContain('opacity-100');

    root.unmount();
    document.body.removeChild(container);
  });
});
