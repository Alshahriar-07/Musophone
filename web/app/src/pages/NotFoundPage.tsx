import { Compass, House, Search } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PrefetchLink } from '@/components/PrefetchLink';
import { stateStyles } from '@/components/music/States';

/**
 * A wrong turn, as a MusoPhone page rather than a browser default.
 *
 * v2.5 left this as one sentence under a title, which read like a rendering
 * failure — the app's only surface that did not look like the product. It now
 * carries the mark, the same type scale as every other page-sized message, and
 * three real destinations: the two pages a listener is most likely to have
 * meant, and the extension page for links shared from an older build.
 */
export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <div className={stateStyles.state}>
        <div className="mb-2 grid size-16 place-items-center rounded-[18px] bg-quinary">
          <Compass size={26} strokeWidth={1.6} className="text-secondary" aria-hidden="true" />
        </div>
        <p className={stateStyles.title}>We couldn’t find that page</p>
        <p className={stateStyles.detail}>
          The link may be from an older MusoPhone build, or the page may have moved. Nothing is broken — pick up
          somewhere else.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <PrefetchLink to="/home" className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-key-bg px-4 type-body-emphasized text-white">
            <House size={14} strokeWidth={2} aria-hidden="true" />
            Go to Home
          </PrefetchLink>
          <PrefetchLink
            to="/search"
            className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-quinary px-4 type-body-emphasized text-primary hover:bg-thin-material"
          >
            <Search size={14} strokeWidth={2} aria-hidden="true" />
            Search
          </PrefetchLink>
        </div>
        <PrefetchLink to="/extension" className="mt-2 type-callout text-key hover:underline">
          Looking for the browser extension?
        </PrefetchLink>
      </div>
    </>
  );
}
