import Image from "next/image";

export interface BrowserFrameProps {
  /** Shown in the address pill. Falls back to a neutral label. */
  url?: string;
  /** Tailwind gradient classes, used when there's no screenshot. */
  accent: string;
  /** Path under public/, e.g. "/shots/expense-tracker.png". */
  screenshot?: string;
  /** Describes the screenshot. Required whenever one is supplied. */
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Strips the scheme so the pill reads like a real omnibox. */
const displayUrl = (url?: string) =>
  url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "localhost:3000";

/**
 * Safari-style chrome around a project preview.
 *
 * When no screenshot is supplied it paints the project's accent gradient
 * instead of an empty state — an "image missing" placeholder on a live
 * portfolio reads as unfinished, whereas the gradient reads as deliberate.
 * Drop a file into `public/` and set `screenshot` to swap it in.
 */
export function BrowserFrame({
  url,
  accent,
  screenshot,
  alt,
  className = "",
  children,
}: BrowserFrameProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-black/10 bg-black/5 shadow-sm dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      {/* Chrome bar */}
      <div className="flex h-7 items-center gap-2 border-b border-black/8 bg-black/6 px-2.5 dark:border-white/8 dark:bg-white/6">
        <div aria-hidden className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-[#FF5F56]" />
          <span className="size-2 rounded-full bg-[#FFBD2E]" />
          <span className="size-2 rounded-full bg-[#27C93F]" />
        </div>
        <span className="mx-auto max-w-[70%] truncate rounded-full bg-black/8 px-2.5 py-0.5 text-[10px] text-foreground/55 dark:bg-white/10">
          {displayUrl(url)}
        </span>
      </div>

      {/* Viewport. The aspect ratio is fixed so swapping a screenshot in
          later can't shift the grid — this is the CLS-safe shape. */}
      <div className={`relative aspect-16/10 bg-linear-to-br ${accent}`}>
        {screenshot && (
          <Image
            src={screenshot}
            alt={alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover object-top"
          />
        )}
        {children}
      </div>
    </div>
  );
}
