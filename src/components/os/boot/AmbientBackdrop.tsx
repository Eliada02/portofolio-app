"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { usePointerParallax } from "@/lib/usePointerParallax";

/**
 * The animated mesh-gradient wallpaper behind the lock screen.
 *
 * Built from blurred radial blobs rather than WebGL. A shader would mean
 * compiling a program, a canvas sized to the device pixel ratio and a render
 * loop running every frame — for a gradient that four composited layers
 * produce identically. These animate on `transform` only, so the whole thing
 * lives on the compositor and costs nothing on the main thread.
 *
 * Each blob drifts on its own slow cycle and parallaxes by a different amount,
 * which is what stops the field reading as one flat sheet sliding around.
 */

type Blob = {
  /** Tailwind positioning for the blob's resting place. */
  className: string;
  color: string;
  /** Viewport fractions of parallax travel — larger reads as nearer. */
  depth: number;
  /** Seconds for one drift cycle. */
  duration: number;
  drift: { x: number[]; y: number[] };
};

const BLOBS: Blob[] = [
  {
    className: "left-[-10%] top-[-15%] size-[70vmax]",
    color: "#DE3163",
    depth: 70,
    duration: 26,
    drift: { x: [0, 40, -20, 0], y: [0, -30, 20, 0] },
  },
  {
    className: "right-[-15%] top-[-10%] size-[60vmax]",
    color: "#9F2B68",
    depth: 45,
    duration: 32,
    drift: { x: [0, -35, 25, 0], y: [0, 25, -15, 0] },
  },
  {
    className: "bottom-[-25%] left-[15%] size-[65vmax]",
    color: "#F2D2BD",
    depth: 26,
    duration: 38,
    drift: { x: [0, 30, -30, 0], y: [0, -20, 15, 0] },
  },
  {
    className: "bottom-[-20%] right-[-5%] size-[50vmax]",
    color: "#7A1F4C",
    depth: 90,
    duration: 22,
    drift: { x: [0, -25, 35, 0], y: [0, 18, -25, 0] },
  },
];

function MeshBlob({ blob }: { blob: Blob }) {
  const { x, y } = usePointerParallax();
  const reduced = useReducedMotion();

  const px = useTransform(x, (v) => v * blob.depth);
  const py = useTransform(y, (v) => v * blob.depth);

  return (
    // Outer layer owns the parallax, inner owns the drift — one transform
    // each, so the two never fight over the same property.
    <motion.div
      style={{ x: px, y: py }}
      className={`absolute ${blob.className}`}
    >
      <motion.div
        animate={reduced ? undefined : { x: blob.drift.x, y: blob.drift.y }}
        transition={{
          duration: blob.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="size-full rounded-full opacity-70 blur-[80px]"
        style={{ backgroundColor: blob.color }}
      />
    </motion.div>
  );
}

export function AmbientBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#160A11]">
      {BLOBS.map((blob) => (
        <MeshBlob key={blob.color} blob={blob} />
      ))}

      {/* Vignette, so the centre stays legible under the login card. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(8_3_6/0.72)_100%)]" />

      {/* A faint grain breaks up the banding that big soft gradients show on
          8-bit displays. */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
