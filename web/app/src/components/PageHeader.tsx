import type { ReactNode } from 'react';

/**
 * The page title row (report §1, `.header-nav`), in MusoPhone's type: a tight
 * large title, with room for one quiet control on the right.
 */
export function PageHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <div className="mx-(--body-gutter) flex items-end justify-between gap-4 pt-8">
      <h1 className="type-header-emphasized tracking-[-0.02em]">{title}</h1>
      {trailing}
    </div>
  );
}
