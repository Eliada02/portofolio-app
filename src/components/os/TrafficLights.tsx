"use client";

import type { SVGProps } from "react";

export interface TrafficLightsProps {
  /** Window title — folded into each control's accessible name. */
  title: string;
  /** Unfocused windows grey their lights out, as macOS does. */
  focused: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}

/* Glyphs are drawn rather than typed: "×" and "–" sit on a text baseline and
   never optically centre inside a 12px circle. */
const glyph = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: "0 0 12 12",
  "aria-hidden": true,
  focusable: "false" as const,
  ...props,
});

function CloseGlyph() {
  return (
    <svg {...glyph({ className: "size-full" })}>
      <path
        d="M4 4l4 4M8 4l-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinimizeGlyph() {
  return (
    <svg {...glyph({ className: "size-full" })}>
      <path
        d="M3.5 6h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Two arrows out (zoom) / two arrows in (restore) — the Sequoia green glyph. */
function ZoomGlyph({ maximized }: { maximized: boolean }) {
  return (
    <svg {...glyph({ className: "size-full" })}>
      {maximized ? (
        <path
          d="M7.6 4.4h-2v2M4.4 7.6h2v-2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : (
        <path
          d="M4.2 7.8V4.2h3.6M7.8 4.2L4.2 7.8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </svg>
  );
}

function Light({
  color,
  label,
  onClick,
  children,
  focused,
}: {
  color: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  focused: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // Don't let a click on a light start a window drag.
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={focused ? { backgroundColor: color } : undefined}
      className={[
        "grid size-3 shrink-0 place-items-center rounded-full",
        // The hairline keeps a light yellow dot from vanishing on white glass.
        "shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.14)]",
        "transition-colors duration-150",
        focused ? "" : "bg-black/20 dark:bg-white/25",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
      ].join(" ")}
    >
      {/* Glyphs reveal on hover of the cluster, and whenever a control is
          keyboard-focused so the affordance isn't hover-only. */}
      <span className="size-2 text-black/55 opacity-0 transition-opacity duration-100 group-hover/lights:opacity-100 [button:focus-visible>&]:opacity-100">
        {children}
      </span>
    </button>
  );
}

/**
 * The three window controls. Presentational — every action is a callback, so
 * the same cluster serves real windows and any other chrome that needs them.
 */
export function TrafficLights({
  title,
  focused,
  maximized,
  onClose,
  onMinimize,
  onToggleMaximize,
}: TrafficLightsProps) {
  return (
    <div className="group/lights flex items-center gap-2">
      <Light
        color="#FF5F56"
        label={`Close ${title}`}
        onClick={onClose}
        focused={focused}
      >
        <CloseGlyph />
      </Light>
      <Light
        color="#FFBD2E"
        label={`Minimize ${title}`}
        onClick={onMinimize}
        focused={focused}
      >
        <MinimizeGlyph />
      </Light>
      <Light
        color="#27C93F"
        label={`${maximized ? "Restore" : "Zoom"} ${title}`}
        onClick={onToggleMaximize}
        focused={focused}
      >
        <ZoomGlyph maximized={maximized} />
      </Light>
    </div>
  );
}
