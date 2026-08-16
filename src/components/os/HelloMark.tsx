"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The handwritten "hello" from the macOS setup screen, drawn stroke-by-stroke.
 *
 * Two paths: the ascender of the "h", then everything else in one continuous
 * cursive line. `pathLength` normalises each path to 0→1, so the draw timing
 * is set in seconds rather than in dash-offset units.
 */

const ASCENDER =
  "M8.69141 166.606C36.2386 151.292 61.3402 131.601 89.8184 98.0823C109.203 75.2016 119.625 49.0755 120.121 31.0553C120.369 17.6563 113.836 7.49156 101.759 7.49156C88.3591 7.49156 79.9224 17.6563 74.7114 40.9891C69.0042 66.632 64.7859 96.0563 54.1159 190.409";

const SCRIPT =
  "M55.1621 181.188C60.6248 133.167 81.4116 98.1009 107.962 98.1009C123.843 98.1009 133.936 110.756 131.071 128.87C129.457 139.54 127.587 150.458 125.408 163.113C122.869 178.994 130.128 191.401 152.122 191.401C184.197 191.401 219.189 173.576 237.097 145.968C243.198 136.562 245.68 128.126 245.928 119.937C246.176 105.049 237.739 93.8826 222.851 93.8826C203.992 93.8826 189.6 115.223 189.6 142.518C189.6 171.798 205.481 192.394 239.208 192.394C285.065 192.394 335.859 137.345 359.198 75.9115C365.788 58.566 368.26 42.4595 368.26 31.2042C368.26 17.8586 364.042 7.61121 352.131 7.61121C340.469 7.61121 332.776 16.6671 325.828 30.9658C317.688 47.5497 311.667 71.4692 309.203 98.5079C303 166.354 316.895 191.401 349.936 191.401C389.999 191.401 434.542 135.587 457.285 75.7216C463.803 58.566 466.275 42.4595 466.275 31.2042C466.275 17.8586 462.057 7.61121 450.146 7.61121C438.484 7.61121 430.791 16.6671 423.843 30.9658C415.703 47.5497 409.682 71.4692 407.218 98.5079C401.015 166.354 414.91 191.401 444.416 191.401C473.874 191.401 489.877 165.723 499.471 138.455C508.955 111.5 520.618 94.8751 544.935 94.8751C565.034 94.8751 580.915 109.763 580.915 137.803C580.915 168.821 560.791 192.146 535.362 192.394C512.983 192.642 498.285 174.528 499.774 147.232C501.511 116.959 519.873 94.8751 543.943 94.8751C557.838 94.8751 569.51 101.052 578.682 107.778C603.549 125.919 622.709 114.709 630.047 96.7716";

/** Seconds. The script picks up while the ascender is still finishing. */
export const HELLO_DRAW = { start: 0.3, ascender: 0.8, script: 2.3, gap: 0.7 };

/** Total time from mount until the last stroke lands. */
export const HELLO_DURATION =
  HELLO_DRAW.start + HELLO_DRAW.gap + HELLO_DRAW.script;

export function HelloMark() {
  const reduced = useReducedMotion();

  const stroke = {
    fill: "none",
    stroke: "#fff",
    strokeWidth: 14.8883,
    strokeLinecap: "round",
  } as const;

  /**
   * A round line cap on a zero-length dash still paints a dot, so an
   * un-started path shows a stray blob sitting at each end — frozen on screen
   * for as long as it takes the page to hydrate. Holding opacity at 0 until
   * the stroke's own delay elapses keeps the path invisible until the pen
   * actually starts moving.
   */
  const draw = (duration: number, delay: number, ease: number[]) => ({
    pathLength: reduced
      ? { duration: 0 }
      : { duration, delay, ease: ease as [number, number, number, number] },
    opacity: { duration: 0, delay: reduced ? 0 : delay },
  });

  return (
    <svg
      viewBox="0 0 638 200"
      className="w-[min(66vw,600px)] overflow-visible"
      aria-label="hello"
      role="img"
      // Its own compositing layer: repainting the stroke each frame then
      // can't force the full-screen gradient behind it to re-rasterise.
      style={{ willChange: "transform" }}
    >
      <motion.path
        d={ASCENDER}
        {...stroke}
        initial={{ pathLength: reduced ? 1 : 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={draw(
          HELLO_DRAW.ascender,
          HELLO_DRAW.start,
          [0.45, 0.05, 0.55, 0.95]
        )}
      />
      <motion.path
        d={SCRIPT}
        {...stroke}
        initial={{ pathLength: reduced ? 1 : 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={draw(
          HELLO_DRAW.script,
          HELLO_DRAW.start + HELLO_DRAW.gap,
          [0.4, 0.1, 0.4, 0.9]
        )}
      />
    </svg>
  );
}
