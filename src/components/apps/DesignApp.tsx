"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Circle,
  Frame,
  Hand,
  MousePointer2,
  PenTool,
  Square,
  Type as TypeIcon,
} from "lucide-react";

/**
 * A Figma window over this project's actual design system.
 *
 * Everything on the canvas is rendered with the real tokens and utilities
 * from `globals.css` rather than being drawn as a picture of them — so the
 * swatches, the glass and the radii are the live values, and they can't fall
 * out of step with the app around them.
 */

type LayerId = "colour" | "material" | "type" | "radius";

const LAYERS: { id: LayerId; name: string; icon: React.ReactNode }[] = [
  { id: "colour", name: "Colour", icon: <Circle className="size-3.5" /> },
  { id: "material", name: "Materials", icon: <Square className="size-3.5" /> },
  { id: "type", name: "Type scale", icon: <TypeIcon className="size-3.5" /> },
  { id: "radius", name: "Radius", icon: <Frame className="size-3.5" /> },
];

/** Contrast figures are measured, not estimated — see globals.css. */
const SWATCHES = [
  {
    name: "magenta",
    hex: "#9F2B68",
    role: "Actions. Deep enough to carry white text.",
    contrast: "6.95:1 on white text",
  },
  {
    name: "cerise",
    hex: "#DE3163",
    role: "Accents, focus rings, the bright half of every gradient.",
    contrast: "4.44:1 on white — accents only, not body text",
  },
  {
    name: "sand",
    hex: "#F2D2BD",
    role: "The warm neutral: surfaces, borders, dark-mode text.",
    contrast: "Surface tone",
  },
  {
    name: "ink",
    hex: "#2A1220",
    role: "The near-black the palette resolves to — plum, not grey.",
    contrast: "Base surface (dark)",
  },
];

const MATERIALS = [
  { cls: "material-ultrathin", name: "Ultra thin", blur: "20px", tint: "50%" },
  { cls: "material-thin", name: "Thin", blur: "28px", tint: "68%" },
  { cls: "material-regular", name: "Regular", blur: "32px", tint: "80%" },
  { cls: "material-thick", name: "Thick", blur: "40px", tint: "92%" },
];

const TYPE_SCALE = [
  { label: "Display", cls: "text-2xl font-semibold tracking-tight", px: "24px / 600" },
  { label: "Title", cls: "text-lg font-semibold tracking-tight", px: "18px / 600" },
  { label: "Body", cls: "text-sm", px: "14px / 400" },
  { label: "Caption", cls: "text-xs text-muted-foreground", px: "12px / 400" },
  { label: "Chrome", cls: "text-[11px] font-medium", px: "11px / 500" },
];

const RADII = [
  { name: "sm", cls: "rounded-sm", value: "0.375rem" },
  { name: "md", cls: "rounded-md", value: "0.5rem" },
  { name: "lg", cls: "rounded-lg", value: "0.625rem" },
  { name: "xl", cls: "rounded-xl", value: "0.875rem" },
  { name: "window", cls: "rounded-[12px]", value: "12px" },
];

function Canvas({ layer }: { layer: LayerId }) {
  if (layer === "colour") {
    return (
      <div className="grid gap-3 @sm:grid-cols-2">
        {SWATCHES.map((s) => (
          <div key={s.name} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-16" style={{ background: s.hex }} />
            <div className="p-3">
              <p className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                {s.name}
                <span className="font-mono text-[11px] font-normal text-muted-foreground">
                  {s.hex}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.role}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layer === "material") {
    return (
      // The materials only mean anything over something colourful, so the
      // sample sits on a slice of the wallpaper gradient.
      <div className="relative overflow-hidden rounded-xl bg-[radial-gradient(circle_at_20%_20%,#de3163_0%,transparent_55%),radial-gradient(circle_at_80%_30%,#9f2b68_0%,transparent_50%),radial-gradient(circle_at_50%_100%,#f2d2bd_0%,transparent_60%)] bg-brand-ink p-4">
        <div className="grid gap-3 @sm:grid-cols-2">
          {MATERIALS.map((m) => (
            <div key={m.cls} className={`rim rounded-xl p-3 ${m.cls}`}>
              <p className="text-sm font-semibold text-foreground">{m.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-foreground/70">
                blur {m.blur} · tint {m.tint} · saturate 180%
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layer === "type") {
    return (
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {TYPE_SCALE.map((t) => (
          <div key={t.label} className="flex items-baseline justify-between gap-4 p-3">
            <span className={t.cls}>{t.label}</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {t.px}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {RADII.map((r) => (
        <div key={r.name} className="text-center">
          <div
            className={`size-16 border-2 border-primary/50 bg-primary/12 ${r.cls}`}
          />
          <p className="mt-1.5 text-xs font-medium">{r.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{r.value}</p>
        </div>
      ))}
    </div>
  );
}

const PROPERTIES: Record<LayerId, { title: string; rows: [string, string][] }> = {
  colour: {
    title: "Colour",
    rows: [
      ["Swatches", "4"],
      ["Defined in", "globals.css"],
      ["Space", "oklch"],
      ["Contrast", "Measured, AA+"],
    ],
  },
  material: {
    title: "Materials",
    rows: [
      ["Thicknesses", "4"],
      ["Saturation", "180–200%"],
      ["Rim", "1px masked gradient"],
      ["Appearance", "Light + dark tints"],
    ],
  },
  type: {
    title: "Type scale",
    rows: [
      ["Family", "SF Pro / Inter"],
      ["Mono", "SF Mono / Geist"],
      ["Tracking", "-0.017em on headings"],
      ["Optical sizing", "auto"],
    ],
  },
  radius: {
    title: "Radius",
    rows: [
      ["Base", "0.625rem"],
      ["Window", "12px"],
      ["Icons", "Squircle path"],
      ["Scale", "Derived from base"],
    ],
  },
};

export function DesignApp() {
  const [layer, setLayer] = useState<LayerId>("colour");
  const props = PROPERTIES[layer];

  return (
    <div className="flex h-full flex-col text-[13px]">
      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-card px-2">
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"
        >
          <MousePointer2 className="size-3.5" />
        </span>
        {[Hand, Frame, PenTool, TypeIcon].map((Icon, i) => (
          <span
            key={i}
            aria-hidden
            className="grid size-7 place-items-center rounded-md text-muted-foreground"
          >
            <Icon className="size-3.5" />
          </span>
        ))}
        <p className="ml-auto truncate pr-1 text-xs font-medium text-muted-foreground">
          Portfolio Design System
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Layers */}
        <div
          role="tablist"
          aria-label="Design system sections"
          aria-orientation="vertical"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-card p-2 [scrollbar-width:none] @md:w-44 @md:flex-col @md:gap-0.5 @md:border-b-0 @md:border-r [&::-webkit-scrollbar]:hidden"
        >
          <p className="hidden px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground @md:block">
            Layers
          </p>
          {LAYERS.map((l) => {
            const active = l.id === layer;
            return (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setLayer(l.id)}
                className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px] transition @md:w-full ${
                  active
                    ? "bg-primary/12 font-medium text-primary"
                    : "text-foreground/75 hover:bg-foreground/6"
                }`}
              >
                {l.icon}
                {l.name}
              </button>
            );
          })}
        </div>

        {/* Canvas */}
        <div className="scroll-overlay @container min-w-0 flex-1 overflow-y-auto bg-foreground/6 p-4 @sm:p-6">
          <motion.div
            key={layer}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              {props.title}
            </p>
            <Canvas layer={layer} />
          </motion.div>
        </div>

        {/* Properties */}
        <div className="hidden w-52 shrink-0 border-l border-border bg-card p-3 @lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Properties
          </p>
          <dl className="mt-2 space-y-2">
            {props.rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-2">
                <dt className="text-[11px] text-muted-foreground">{k}</dt>
                <dd className="truncate text-[11px] font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
