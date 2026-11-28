import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface BannerProps {
  title: string;
  detail: string;
  action: ReactNode;
  onDismiss?: () => void;
}

/**
 * The invitation to install the extension (or the app, on a phone): a glass
 * card laid over the sheet's foot, above the dock — not a band painted across
 * the whole app. It carries one accent action and can be dismissed.
 */
export function Banner({ title, detail, action, onDismiss }: BannerProps) {
  return (
    <div
      className="glass-dialog pointer-events-auto absolute bottom-[calc(var(--player-bottom-offset)+var(--player-pill-height)+14px)] left-4 z-(--z-web-chrome) flex w-[min(430px,calc(100%-2rem))] animate-rise items-center gap-3 rounded-[18px] px-4 py-2.5 max-sm:bottom-[calc(var(--player-bottom-offset)+70px+10px)] max-sm:left-3"
      role="region"
      aria-label={title}
    >
      <div className="min-w-0 flex-1">
        <p className="type-[600_12.5px/17px]">{title}</p>
        <p className="mt-0.5 line-clamp-2 type-[500_10.5px/14px] text-secondary">{detail}</p>
      </div>
      <div className="shrink-0">{action}</div>
      {onDismiss && (
        <button
          className="press -mr-1.5 grid size-6 shrink-0 place-items-center rounded-full text-tertiary hover:bg-quinary hover:text-primary"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export const bannerButtonClass =
  'inline-flex h-8 items-center whitespace-nowrap rounded-pill bg-key-bg px-4 type-[600_12px/15px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] transition-[filter,transform] duration-(--duration-fast) hover:brightness-[1.12] active:scale-95';
