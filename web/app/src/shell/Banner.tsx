import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface BannerProps {
  title: string;
  detail: string;
  action: ReactNode;
  onDismiss?: () => void;
}

/**
 * The band under the player. v2.5 makes it a quiet charcoal surface with one
 * accent action rather than a full-width block of accent colour: an invitation
 * laid over the app, not a warning painted across it. A hairline along its top
 * edge is the only boundary it needs.
 */
export function Banner({ title, detail, action, onDismiss }: BannerProps) {
  return (
    <div
      className="relative z-(--z-web-chrome) flex min-h-[71px] items-center gap-4 border-t border-(--labelDivider) bg-(--systemStandardThickMaterialSover) px-[30px] py-3 max-sm:pr-4 max-sm:pl-5"
      role="region"
      aria-label={title}
    >
      <div className="min-w-0 flex-1">
        <p className="type-title-2-emphasized max-sm:type-[700_15px/20px]">{title}</p>
        <p className="mt-0.5 type-callout-medium text-secondary">{detail}</p>
      </div>
      <div className="shrink-0">{action}</div>
      {onDismiss && (
        <button
          className="-mr-3.5 grid size-7 place-items-center rounded-full text-secondary hover:bg-quinary hover:text-primary"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export const bannerButtonClass =
  'inline-flex h-8 items-center whitespace-nowrap rounded-pill bg-key-bg px-4 type-body-emphasized text-white transition-[filter] duration-(--duration-fast) ease-standard hover:brightness-[1.12] active:brightness-[0.95]';
