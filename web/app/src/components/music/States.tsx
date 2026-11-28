import { LogoMark } from '@/components/icons/LogoMark';
import { PrefetchLink } from '@/components/PrefetchLink';
import { recheckExtension, useExtension } from '@/extension/useExtension';

/** A page-sized message: a glass scene rather than a small card in a large void. */
export const stateStyles = {
  state:
    'relative mx-auto my-10 flex w-[min(560px,100%)] flex-col items-center gap-3 overflow-hidden rounded-[8px] bg-[#181818] border border-white/[0.04] px-8 py-10 text-center shadow-lg',
  glow: 'pointer-events-none absolute -top-24 left-1/2 -z-1 size-64 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--keyColor)_18%,transparent),transparent)] blur-2xl',
  mark: 'relative grid size-14 place-items-center rounded-[8px] bg-[#242424] text-white shadow-sm',
  title: 'text-[20px] font-bold text-white tracking-tight',
  detail: 'max-w-[420px] text-[13.5px] text-[#b3b3b3] leading-relaxed',
  footnote: 'mt-1 max-w-[400px] text-[12px] text-[#727272]',
  actions: 'mt-4 flex items-center gap-3',
  button:
    'inline-flex h-9.5 items-center rounded-[6px] bg-white px-5 text-[13px] font-bold text-black transition-transform hover:scale-102 active:scale-98 shadow-sm',
  quietButton: 'text-[13px] font-semibold text-[#b3b3b3] hover:text-white transition-colors',
};

/**
 * In place of a YouTube page when the extension isn't answering: an
 * invitation, plus what the last handshake actually saw and a way to retry.
 */
export function NeedsExtension({ what = 'YouTube Music' }: { what?: string }) {
  const status = useExtension();
  const hint = status.state === 'missing' ? status.diagnostics.hint : null;
  return (
    <div className={stateStyles.state}>
      <span className={stateStyles.glow} aria-hidden="true" />
      <span className={stateStyles.mark}>
        <LogoMark size={44} />
      </span>
      <p className={stateStyles.title}>Browse {what} with the MusoPhone extension</p>
      <p className={stateStyles.detail}>
        The extension lets this page reach YouTube Music from your own browser. Addons and lyrics work without it.
      </p>
      <div className={stateStyles.actions}>
        <PrefetchLink to="/extension" className={stateStyles.button}>
          Get the Extension
        </PrefetchLink>
        <button className={stateStyles.quietButton} onClick={() => void recheckExtension()}>
          Check again
        </button>
      </div>
      {hint && <p className={stateStyles.footnote}>{hint}</p>}
    </div>
  );
}

export function LoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className={stateStyles.state}>
      <span className={stateStyles.glow} aria-hidden="true" />
      <span className={stateStyles.mark}>
        <LogoMark size={40} />
      </span>
      <p className={stateStyles.title}>Couldn’t load this page</p>
      <p className={stateStyles.detail}>{error instanceof Error ? error.message : String(error)}</p>
      <div className={stateStyles.actions}>
        <button className={stateStyles.button} onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className={stateStyles.state}>
      <span className={stateStyles.glow} aria-hidden="true" />
      <span className={stateStyles.mark}>
        <LogoMark size={40} />
      </span>
      <p className={stateStyles.title}>{title}</p>
      {detail && <p className={stateStyles.detail}>{detail}</p>}
    </div>
  );
}

/** A later page of a long list failed: what's loaded stays, with a way to try again. */
export function LoadMoreError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-(--body-gutter) pt-6 pb-10 type-callout text-secondary">
      <span>Couldn’t load more.</span>
      <button className="type-callout-emphasized text-key hover:underline" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
