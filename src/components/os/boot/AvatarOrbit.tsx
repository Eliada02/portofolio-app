"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { Avatar } from "@/components/Avatar";
import { BrandIcon } from "@/components/BrandIcon";
import { usePointerParallax } from "@/lib/usePointerParallax";

/**
 * The lock-screen avatar: a 3D-tilting portrait ringed by orbiting tech
 * badges.
 *
 * The badges counter-rotate against their ring. Without that they'd cartwheel
 * as the ring turns, and a logo upside-down reads as broken rather than as
 * motion.
 */

interface Satellite {
  label: string;
  /** Degrees around the ring at rest. */
  angle: number;
}

interface Ring {
  /** Orbit radius in px at the component's base size. */
  radius: number;
  /** Seconds per revolution. Opposite signs make the rings counter-rotate. */
  duration: number;
  direction: 1 | -1;
  satellites: Satellite[];
}

const RINGS: Ring[] = [
  {
    radius: 92,
    duration: 28,
    direction: 1,
    satellites: [
      { label: "React", angle: 0 },
      { label: "TypeScript", angle: 180 },
    ],
  },
  {
    radius: 126,
    duration: 38,
    direction: -1,
    satellites: [
      { label: "Next.js", angle: 90 },
      { label: "Node.js", angle: 270 },
    ],
  },
];

const BADGE = 34;

function Orbit({ ring }: { ring: Ring }) {
  const reduced = useReducedMotion();
  const spin = ring.direction * 360;

  return (
    <>
      {/* The ring itself — a faint glowing track. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 rounded-full border border-white/12"
        style={{
          width: ring.radius * 2,
          height: ring.radius * 2,
          marginLeft: -ring.radius,
          marginTop: -ring.radius,
          boxShadow: "0 0 24px rgb(222 49 99 / 0.18) inset",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-0"
        animate={reduced ? undefined : { rotate: spin }}
        transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
      >
        {ring.satellites.map((sat) => (
          <div
            key={sat.label}
            className="absolute"
            // Place on the ring, then undo the placement rotation so the badge
            // starts upright; the inner element handles the animated part.
            style={{
              transform: `rotate(${sat.angle}deg) translateY(${-ring.radius}px) rotate(${-sat.angle}deg)`,
              marginLeft: -BADGE / 2,
              marginTop: -BADGE / 2,
            }}
          >
            <motion.div
              animate={reduced ? undefined : { rotate: -spin }}
              transition={{
                duration: ring.duration,
                repeat: Infinity,
                ease: "linear",
              }}
              className="grid place-items-center rounded-xl border border-white/20 bg-white/12 shadow-lg backdrop-blur-md"
              style={{ width: BADGE, height: BADGE }}
              title={sat.label}
            >
              <BrandIcon label={sat.label} className="size-4" />
            </motion.div>
          </div>
        ))}
      </motion.div>
    </>
  );
}

export function AvatarOrbit() {
  const { x, y } = usePointerParallax();

  // Tilt away from the cursor, the way a physical card would lean.
  const rotateY = useTransform(x, (v) => v * 22);
  const rotateX = useTransform(y, (v) => v * -22);

  return (
    <div
      // The ring radii are fixed px, so the assembly scales as a unit to fit
      // a small phone instead of each orbit needing its own breakpoint.
      className="relative grid size-[300px] scale-[0.78] place-items-center sm:scale-100"
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative grid size-full place-items-center"
      >
        {RINGS.map((ring) => (
          <Orbit key={ring.radius} ring={ring} />
        ))}

        {/* Glow pooled under the portrait. */}
        <div
          aria-hidden
          className="absolute size-40 rounded-full bg-brand-cerise/30 blur-3xl"
        />

        <motion.div
          // Lifted toward the viewer so the tilt genuinely separates it from
          // the rings behind.
          style={{ translateZ: 40 }}
          className="relative"
        >
          <Avatar className="size-28 rounded-full shadow-2xl ring-2 ring-white/25 sm:size-32" />
        </motion.div>
      </motion.div>
    </div>
  );
}
