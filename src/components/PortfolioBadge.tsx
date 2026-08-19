/**
 * The product label: what this interface actually is, stated plainly rather
 * than left for a visitor to infer from the wallpaper.
 *
 * Shared by the welcome window and the About header — the same claim in two
 * places, so it lives in one. Text only: the badge already carries its meaning
 * in the words, and an icon beside it would only be ornament.
 */
export function PortfolioBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-semibold text-primary ${className}`}
    >
      Interactive macOS Portfolio
    </span>
  );
}
