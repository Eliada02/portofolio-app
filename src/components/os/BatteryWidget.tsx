"use client";

import { useBattery } from "@/lib/useBattery";

/**
 * The menu-bar battery. Drawn rather than borrowed from an icon set so the
 * fill can track the real level — a static icon can't show 23%.
 */
export function BatteryWidget({ showPercent = true }: { showPercent?: boolean }) {
  const { level, charging, supported } = useBattery();
  const percent = Math.round(level * 100);

  // macOS turns the fill red below 20%, and green only while charging.
  const fill = charging
    ? "#3ddc63"
    : percent <= 20
      ? "#ff453a"
      : "currentColor";

  return (
    <div
      className="flex items-center gap-1.5"
      // Without the API there's no honest reading to announce.
      title={supported ? `Battery ${percent}%${charging ? " — charging" : ""}` : "Battery"}
    >
      {showPercent && supported && (
        <span className="hidden text-[11px] tabular-nums opacity-90 lg:inline">
          {percent}%
        </span>
      )}
      <svg
        width="26"
        height="13"
        viewBox="0 0 26 13"
        aria-hidden
        focusable="false"
        className="shrink-0"
      >
        {/* Shell */}
        <rect
          x="0.6"
          y="0.6"
          width="22"
          height="11.8"
          rx="3.4"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.1"
        />
        {/* Terminal nub */}
        <path
          d="M24.1 4.6v3.8c.9-.35 1.4-1.05 1.4-1.9s-.5-1.55-1.4-1.9z"
          fill="currentColor"
          fillOpacity="0.45"
        />
        {/* Level — min width keeps a sliver visible at 1% */}
        <rect
          x="2.2"
          y="2.2"
          width={Math.max(2, 18.8 * level)}
          height="8.6"
          rx="2"
          fill={fill}
        />
        {charging && (
          <path
            d="M12.4 2.6l-3.5 4.6h2.6l-.9 3.4 3.6-4.7h-2.7z"
            fill="#0b2a12"
            fillOpacity="0.85"
          />
        )}
      </svg>
      <span className="sr-only">
        {supported
          ? `Battery at ${percent} percent${charging ? ", charging" : ""}`
          : "Battery level unavailable"}
      </span>
    </div>
  );
}
