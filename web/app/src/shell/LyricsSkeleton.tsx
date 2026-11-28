/**
 * Spotify-style clean animated lyrics skeleton.
 * Displayed immediately when lyrics are loading or when switching tracks,
 * preventing any frozen or blank panel appearance.
 */
export function LyricsSkeleton() {
  const linePaddings = ['w-[65%]', 'w-[85%]', 'w-[45%]', 'w-[75%]', 'w-[90%]', 'w-[60%]', 'w-[80%]', 'w-[50%]'];
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-6 space-y-4 animate-pulse select-none" aria-label="Loading lyrics">
      {linePaddings.map((width, idx) => (
        <div
          key={idx}
          className={`h-5 rounded-[6px] bg-white/[0.07] ${width} ${idx === 2 || idx === 3 ? 'h-6 bg-white/[0.14]' : ''}`}
          style={{
            animationDelay: `${idx * 100}ms`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
}
