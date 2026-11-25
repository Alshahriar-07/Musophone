// The sidebar's icons, in MusoPhone's one icon language: a 24px box, an open
// stroked outline at 1.9 weight, round caps and joins — the same proportions as
// the Android app's MusoIcons, so the site and the phone read as one product.
// Drawn from lucide (already a dependency) rather than a second icon library,
// and never filled, so selection is carried by tint and surface instead.

import { Clock, Disc3, Film, House, LayoutGrid, ListMusic, Music, Search, Sparkles, Users, type LucideProps } from 'lucide-react';

export type NavIconProps = Omit<LucideProps, 'ref'> & { size?: number };

const strokeWidth = 1.9;

function navIcon(Glyph: typeof House) {
  return function NavIcon({ size = 24, ...props }: NavIconProps) {
    return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
  };
}

export const SearchIcon = navIcon(Search);
export const HomeIcon = navIcon(House);
export const NewIcon = navIcon(LayoutGrid);
export const RecentlyAddedIcon = navIcon(Clock);
export const ArtistsIcon = navIcon(Users);
export const AlbumsIcon = navIcon(Disc3);
export const SongsIcon = navIcon(Music);
export const MusicVideosIcon = navIcon(Film);
export const MadeForYouIcon = navIcon(Sparkles);
export const AllPlaylistsIcon = navIcon(ListMusic);
