"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { DESKTOP_ITEMS, type DesktopItem } from "@/lib/desktopItems";
import { useOS } from "@/lib/store";
import { useIsTouch } from "@/lib/useMediaQuery";
import { AppIcon } from "./AppIcon";

/**
 * The desktop surface: shortcuts sitting on the wallpaper, beneath every
 * window, and draggable anywhere inside it.
 *
 * Z-order is the point of this layer. It occupies z-0 — above the wallpaper
 * at -z-10, below windows which start at z-10 — so an open window always
 * covers the icons, exactly as on a real desktop.
 */

/** Slot geometry. `ROWS` is where a column wraps and a new one starts. */
const SLOT = { width: 80, height: 94, gap: 4, top: 36, right: 8 };
const ROWS = 4;

export interface IconSlot {
  /** Distance from the right edge of the desktop, in px. */
  right: number;
  /** Distance from the top of the desktop, in px. */
  top: number;
}

/**
 * Default position for an icon, anchored to the top-right and growing
 * leftward — where macOS puts things and the direction it fills.
 */
function slotFor(index: number): IconSlot {
  const column = Math.floor(index / ROWS);
  const row = index % ROWS;
  return {
    right: SLOT.right + column * (SLOT.width + SLOT.gap),
    top: SLOT.top + row * (SLOT.height + SLOT.gap),
  };
}

interface IconProps {
  item: DesktopItem;
  slot: IconSlot;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  /** Touch has no double-click, so one tap has to do both jobs. */
  tapToOpen: boolean;
  /** Keeps a dragged icon inside the desktop. */
  bounds: React.RefObject<HTMLDivElement | null>;
  offset: { x: number; y: number };
  onMoved: (x: number, y: number) => void;
}

function Icon({
  item,
  slot,
  selected,
  onSelect,
  onOpen,
  tapToOpen,
  bounds,
  offset,
  onMoved,
}: IconProps) {
  const isLink = "href" in item.target;
  const x = useMotionValue(offset.x);
  const y = useMotionValue(offset.y);

  /**
   * A drag ends with a click event on the same element. Without this the
   * gesture that drops an icon also counts as the tap that opens it — the
   * single most common bug in draggable launchers.
   */
  const dragged = useRef(false);

  const activate = (open: boolean) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (open) onOpen();
    else onSelect();
  };

  return (
    <motion.button
      type="button"
      data-icon-id={item.id}
      drag
      dragConstraints={bounds}
      dragMomentum={false}
      dragElastic={0.04}
      // The icon stays where it's dropped; the store remembers the offset.
      dragSnapToOrigin={false}
      style={{ x, y, right: slot.right, top: slot.top }}
      onDragStart={() => {
        dragged.current = true;
        onSelect();
      }}
      onDragEnd={() => onMoved(x.get(), y.get())}
      onClick={() => activate(tapToOpen)}
      onDoubleClick={() => activate(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onFocus={onSelect}
      aria-pressed={selected}
      // Screen readers get the outcome, not the gesture.
      aria-label={
        isLink ? `${item.label} — opens in a new tab` : `Open ${item.label}`
      }
      whileTap={{ scale: 0.94 }}
      whileDrag={{ scale: 1.06, zIndex: 5 }}
      className="group absolute flex w-20 cursor-default touch-none flex-col items-center gap-1 rounded-lg p-1.5 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80"
    >
      {/* Selection wash. A shared layoutId slides it between icons rather
          than cross-fading, which is what Finder does. */}
      {selected && (
        <motion.span
          layoutId="desktop-selection"
          transition={{ type: "spring", stiffness: 520, damping: 40 }}
          className="absolute inset-0 rounded-lg bg-white/22 ring-1 ring-white/35 backdrop-blur-sm dark:bg-white/15"
        />
      )}

      <span className="relative">
        {item.shape === "tile" ? (
          <AppIcon
            art={item.Art}
            className="size-14 transition-transform duration-150 group-hover:scale-[1.04]"
          />
        ) : (
          // Folders and documents keep their own silhouette — no squircle.
          <span
            className="block size-14 transition-transform duration-150 group-hover:scale-[1.04]"
            style={{
              filter:
                "drop-shadow(0 1px 1px rgb(0 0 0 / 0.3)) drop-shadow(0 4px 8px rgb(0 0 0 / 0.22))",
            }}
          >
            <item.Art />
          </span>
        )}

        {item.alias && (
          <span
            aria-hidden
            title="Alias — opens off-site"
            className="absolute -bottom-0.5 -left-1 grid size-5 place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/10"
          >
            <ArrowUpRight className="size-3 text-black/70" strokeWidth={2.5} />
          </span>
        )}
      </span>

      <span
        className={[
          "relative max-w-full truncate rounded px-1.5 py-px text-[11px] font-medium leading-tight",
          // A wallpaper can be any colour under a label, so the text carries
          // its own shadow rather than relying on contrast with the image.
          selected
            ? "bg-primary text-primary-foreground"
            : "text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.65)]",
        ].join(" ")}
      >
        {item.label}
      </span>
    </motion.button>
  );
}

export function DesktopIcons() {
  const openApp = useOS((s) => s.openApp);
  const iconOffsets = useOS((s) => s.iconOffsets);
  const setIconOffset = useOS((s) => s.setIconOffset);
  const isTouch = useIsTouch();
  const [selected, setSelected] = useState<string | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const open = (item: DesktopItem) => {
    setSelected(item.id);
    if ("href" in item.target) {
      window.open(item.target.href, "_blank", "noopener,noreferrer");
      return;
    }
    openApp(item.target.app);
  };

  const moveSelection = (delta: number) => {
    const index = DESKTOP_ITEMS.findIndex((i) => i.id === selected);
    const next = (index + delta + DESKTOP_ITEMS.length) % DESKTOP_ITEMS.length;
    const id = DESKTOP_ITEMS[next].id;
    setSelected(id);
    surfaceRef.current
      ?.querySelector<HTMLButtonElement>(`[data-icon-id="${id}"]`)
      ?.focus();
  };

  return (
    <div
      ref={surfaceRef}
      role="group"
      aria-label="Desktop shortcuts"
      // The drag boundary. Insets keep icons clear of the menu bar and dock.
      className="absolute inset-x-0 bottom-24 top-7 z-0"
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          moveSelection(1);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          moveSelection(-1);
        } else if (e.key === "Escape") {
          setSelected(null);
        }
      }}
    >
      {/* Clicking bare desktop clears the selection, as Finder does. This
          catcher sits under the icons and under every window, so it only
          ever receives clicks that genuinely landed on the wallpaper. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => setSelected(null)}
        className="absolute inset-0 cursor-default"
      />

      {DESKTOP_ITEMS.map((item, i) => (
        <Icon
          key={item.id}
          item={item}
          slot={slotFor(i)}
          selected={selected === item.id}
          onSelect={() => setSelected(item.id)}
          onOpen={() => open(item)}
          tapToOpen={isTouch}
          bounds={surfaceRef}
          offset={iconOffsets[item.id] ?? { x: 0, y: 0 }}
          onMoved={(x, y) => setIconOffset(item.id, x, y)}
        />
      ))}
    </div>
  );
}
