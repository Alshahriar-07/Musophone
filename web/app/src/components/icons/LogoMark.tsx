import iconUrl from '@/assets/musophone-icon.png';

/**
 * MusoPhone's official app mark, at the size the chrome needs. The artwork is
 * the project's own icon (assets/icon.png, copied at 256px), never a redrawn
 * substitute, so the header, the PWA tile, the extension toolbar and the
 * Android launcher all show the same symbol.
 */
export function LogoMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-[22%] object-contain ${className ?? ''}`}
      style={{ width: size, height: size }}
    />
  );
}
