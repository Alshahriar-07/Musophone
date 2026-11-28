import type { ReactNode } from 'react';

/**
 * The page's title row: a large, tightly tracked display line over a soft
 * accent bloom, with room for one quiet control on the right. It is the first
 * thing the sheet shows, so it carries the page's identity.
 */
export function PageHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <div className="relative mx-(--body-gutter) flex items-end justify-between gap-4 pt-9 pb-1">
      <div className="relative min-w-0">
        <span
          className="pointer-events-none absolute -top-6 -left-4 h-16 w-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--keyColor)_16%,transparent),transparent)] blur-2xl"
          aria-hidden="true"
        />
        <h1 className="relative truncate text-[clamp(30px,3.2vw,42px)] leading-[1.06] font-bold tracking-[-0.035em]">
          {title}
        </h1>
      </div>
      {trailing}
    </div>
  );
}
