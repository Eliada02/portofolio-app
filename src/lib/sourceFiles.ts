/**
 * Excerpts of this repository's own source, shown in the Code app.
 *
 * These are copies, not imports — a static export can't read its own files at
 * runtime, and bundling raw source through a loader would ship every byte
 * twice. They're deliberately short and chosen for the decisions they show
 * rather than for coverage, so there is little here to drift.
 */

export type SourceFile = {
  /** Path as it appears in the repo — used as the tab and tree label. */
  path: string;
  language: "ts" | "tsx" | "css";
  /** Why this file is worth opening; shown under the tab. */
  note: string;
  code: string;
};

export const SOURCE_FILES: SourceFile[] = [
  {
    path: "src/lib/useWindowGeometry.ts",
    language: "ts",
    note: "Why dragging a window costs zero React renders.",
    code: `/**
 * Mirrors a window's stored geometry into motion values.
 *
 * Position and size live outside React state on purpose: a drag updates a
 * MotionValue and Framer writes the transform straight to the compositor,
 * so moving a window costs zero React renders. Committing to the store
 * only happens once, when the gesture ends.
 */
export function useWindowGeometry(target: Geometry): WindowGeometry {
  const x = useMotionValue(target.x);
  const y = useMotionValue(target.y);
  const width = useMotionValue(target.width);
  const height = useMotionValue(target.height);

  useEffect(() => {
    const pairs = [
      [x, target.x],
      [y, target.y],
      [width, target.width],
      [height, target.height],
    ];

    const running = pairs
      // Skip anything already on target — after a drag commit the motion
      // value is usually identical, and re-animating it would fight the
      // gesture that just ended.
      .filter(([value, next]) => Math.abs(value.get() - next) > 0.5)
      .map(([value, next]) => animate(value, next, SPRING));

    return () => running.forEach((control) => control.stop());
  }, [target.x, target.y, target.width, target.height]);

  return { x, y, width, height };
}`,
  },
  {
    path: "src/lib/theme.ts",
    language: "ts",
    note: "Applying the saved appearance before the first paint.",
    code: `// Inlined into <head> and executed synchronously while the HTML is
// parsed, so .dark lands on <html> before the first paint. Doing this
// from React would flash the light theme on every load for dark-mode
// users — the class would only be applied after hydration.

function applyToDocument() {
  const resolved = resolve(cachedTheme ?? readStoredTheme());
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  // Tells the UA to render form controls and scrollbars in the right shade.
  root.style.colorScheme = resolved;

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[resolved]);
}

export function setTheme(next: Theme) {
  cachedTheme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // private mode / storage disabled — the theme just won't persist
  }
  applyToDocument();
  listeners.forEach((l) => l());
}`,
  },
  {
    path: "src/app/globals.css",
    language: "css",
    note: "Why the glass needs saturation, not just blur.",
    code: `/* macOS doesn't have "a blur" — it has a small set of named materials,
   each a fixed tint + blur + saturation pairing. Saturation is the part
   people skip: a plain backdrop-blur over a colourful desktop turns muddy
   grey, because blurring averages hues toward the mean. Boosting
   saturation past 100% keeps the wallpaper's colour alive through the
   glass. */

@utility material-thin {
  background-color: rgb(var(--material-tint) / 0.68);
  backdrop-filter: blur(28px) saturate(180%);
}

/* A floating macOS panel is lit from above: its top edge catches a bright
   1px highlight that fades away by the bottom. A plain border can't do
   that — a border is one flat colour on all four sides. This paints a
   gradient into a 1px ring using a mask, so the highlight can fall off. */

@utility rim {
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(to bottom, rgb(255 255 255 / 0.65), transparent);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
}`,
  },
  {
    path: "src/lib/store.ts",
    language: "ts",
    note: "Keeping every window inside the viewport on resize.",
    code: `/** Space reserved for the menu bar (top) and the dock (bottom). */
const CHROME = { top: 36, bottom: 96, gutter: 8 };
const MIN_SIZE = { width: 320, height: 260 };

/** Shrink + reposition a window so it always sits fully inside the viewport. */
function fitToViewport(win: Rect, vw: number, vh: number) {
  const width = clamp(
    win.width,
    MIN_SIZE.width,
    Math.max(MIN_SIZE.width, vw - CHROME.gutter * 2)
  );
  const height = clamp(
    win.height,
    MIN_SIZE.height,
    Math.max(MIN_SIZE.height, vh - CHROME.top - CHROME.bottom)
  );

  return {
    width: Math.round(width),
    height: Math.round(height),
    x: Math.round(clamp(win.x, CHROME.gutter, vw - width - CHROME.gutter)),
    y: Math.round(clamp(win.y, CHROME.top, vh - height - CHROME.bottom)),
  };
}`,
  },
];
