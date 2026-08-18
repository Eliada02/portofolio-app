"use client";

import type { AppMeta } from "@/lib/apps";

/**
 * Apple doesn't use a plain rounded rectangle — app icons are a superellipse
 * ("squircle") with continuous corner curvature. A `border-radius` can't
 * express that, so we clip to a real path instead.
 *
 * Coordinates are normalised (objectBoundingBox) so one path scales to every
 * icon size, including the dock's animated magnification.
 */
const SQUIRCLE_PATH =
  "M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5";

/** Mount once, near the root — every AppIcon references this clip path. */
export function SquircleDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <clipPath id="macos-squircle" clipPathUnits="objectBoundingBox">
          <path d={SQUIRCLE_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

export function AppIcon({
  app,
  // The caller owns sizing — passing a size here would collide with `size-full`.
  className = "size-full",
}: {
  app: AppMeta;
  className?: string;
}) {
  const Art = app.Art;

  return (
    // The shadow lives on an outer wrapper: `drop-shadow` follows the clipped
    // silhouette, whereas `box-shadow` would trace the unclipped box.
    <div
      className={`relative ${className}`}
      style={{
        filter:
          "drop-shadow(0 1px 1px rgba(0,0,0,0.28)) drop-shadow(0 4px 8px rgba(0,0,0,0.22))",
      }}
    >
      <div
        className="relative size-full overflow-hidden"
        style={{
          clipPath: "url(#macos-squircle)",
          // Fallback if a browser refuses the SVG clip path: rounded corners
          // rather than a hard square. Ignored wherever the clip applies.
          borderRadius: "22.5%",
        }}
      >
        <Art />
        {/* Top gloss — Apple's icons catch light across the upper half. Kept
            light so it reads as lighting, not as the old glassy iOS dome. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/14 to-transparent" />
        {/* Inner rim: bright hairline on top, dark one at the bottom. */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.18)]" />
      </div>
    </div>
  );
}
