import Image from "next/image";
import { useId } from "react";
import { profile } from "@/lib/data";

/**
 * The developer avatar.
 *
 * `profile.photo` points at `public/avatar-1.svg` — a traced vector of the
 * portrait, so it scales cleanly to every size this renders at. It's served
 * as an image rather than inlined: at ~150KB of path data, inlining it would
 * put the whole thing in the HTML on every page load and repeat it for each
 * of the three places an avatar appears.
 *
 * `DrawnPortrait` below is the fallback for when no photo is configured.
 * Its palette is sampled from the source image, not eyeballed, and its
 * gradient ids are namespaced with `useId` — this renders more than once per
 * page, and duplicate ids would make every instance resolve to the first
 * one's gradients.
 */

/** Sampled from avatar-1.avif. */
const C = {
  hairMid: "#4A1310",
  hairGlow: "#8A3A1E",
  browDark: "#2B0A0A",
  skin: "#F07830",
  skinShade: "#D45F22",
  skinDeep: "#B94E1A",
  frame: "#241010",
  iris: "#6B3A1B",
  pupil: "#2B1108",
  mouth: "#8A2A22",
  lip: "#C4563F",
  topShade: "#E08C14",
};

/**
 * The afro, as overlapping discs: [cx, cy, r]. Sized to leave a margin inside
 * the 120-unit circle — an afro that reaches the crop loses its silhouette,
 * which is the most recognisable thing about it.
 */
const HAIR_BACK: [number, number, number][] = [
  [60, 40, 26], [60, 30, 20], [40, 32, 19], [80, 32, 19],
  [48, 22, 14], [72, 22, 14], [34, 50, 17], [86, 50, 17],
  [30, 58, 14], [90, 58, 14], [36, 66, 15], [84, 66, 15],
  [44, 74, 13], [76, 74, 13],
];

/** Coil texture — barely off the base value, so it doesn't punch holes. */
const HAIR_COILS: [number, number, number][] = [
  [38, 30, 8], [50, 20, 7], [70, 20, 6.5], [82, 31, 7.5],
  [32, 50, 7.5], [88, 50, 7.5], [37, 66, 6.5], [83, 66, 6.5], [60, 24, 7],
];

/** Rim light along the top-left, where the key is. */
const HAIR_RIM: [number, number, number][] = [
  [36, 24, 7], [46, 16, 6], [27, 42, 6], [24, 55, 5],
];

/** Curls breaking over the hairline, high enough to leave a forehead. */
const HAIR_FRINGE: [number, number, number][] = [
  [46, 27, 7.5], [58, 24.5, 8], [70, 27, 7.5], [78, 34, 7], [42, 34, 7],
];

export interface AvatarProps {
  className?: string;
  /**
   * Overrides `profile.photo`. Pass `null` to force the drawn portrait even
   * when a photo is configured.
   */
  photo?: string | null;
}

/**
 * Renders `profile.photo` when one is set, and the drawn portrait otherwise.
 * Both fill the same round frame, so every caller keeps its own sizing and
 * ring and nothing else has to change when a photo is added.
 */
export function Avatar({ className = "size-24", photo }: AvatarProps) {
  const src = photo === undefined ? profile.photo : photo;

  if (src) {
    return (
      <span className={`relative block overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={`Portrait of ${profile.name}`}
          fill
          // Covers the 128px frame at 2x on retina without over-fetching.
          sizes="256px"
          className="object-cover"
          style={{ objectPosition: profile.photoPosition }}
          priority
        />
      </span>
    );
  }

  return <DrawnPortrait className={className} />;
}

function DrawnPortrait({ className }: { className: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `avatar-${uid}-${name}`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Illustrated portrait: a developer with curly hair and glasses"
    >
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FDF4EC" />
          <stop offset="1" stopColor="#F3DCCB" />
        </linearGradient>
        <linearGradient id={id("skin")} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#F79447" />
          <stop offset="0.55" stopColor={C.skin} />
          <stop offset="1" stopColor={C.skinShade} />
        </linearGradient>
        {/* Radial, so the hair reads as one lit volume rather than flat discs. */}
        <radialGradient id={id("hair")} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#59180F" />
          <stop offset="0.55" stopColor="#3A0E0C" />
          <stop offset="1" stopColor="#250707" />
        </radialGradient>
        <linearGradient id={id("top")} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#F8A828" />
          <stop offset="1" stopColor={C.topShade} />
        </linearGradient>
        <clipPath id={id("clip")}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id("clip")})`}>
        <rect width="120" height="120" fill={`url(#${id("bg")})`} />

        <g fill={`url(#${id("hair")})`}>
          {HAIR_BACK.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g fill={C.hairMid} opacity="0.32">
          {HAIR_COILS.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g fill={C.hairGlow} opacity="0.3">
          {HAIR_RIM.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>

        {/* Neck, with the shadow the jaw casts onto the throat. */}
        <path d="M52.5 72h15v19h-15z" fill={C.skinShade} />
        <ellipse cx="60" cy="75" rx="10" ry="4.5" fill={C.skinDeep} opacity="0.5" />

        {/* Shoulders */}
        <path
          d="M6 120c2-18 22-30 54-30s52 12 54 30z"
          fill={`url(#${id("top")})`}
        />
        <path
          d="M45 92.5c4.4 6 21.2 6 25.6 0-4.2-1.4-8.6-2.1-12.8-2.1s-8.6.7-12.8 2.1z"
          fill={C.topShade}
          opacity="0.75"
        />

        {/* Ears */}
        <ellipse cx="41.5" cy="58" rx="4.6" ry="6.2" fill={C.skinShade} />
        <ellipse cx="78.5" cy="58" rx="4.6" ry="6.2" fill={`url(#${id("skin")})`} />

        {/* Face */}
        <path
          d="M41.5 51c0-13.4 8.2-22 18.5-22s18.5 8.6 18.5 22v7.5c0 14.6-8.2 24-18.5 24s-18.5-9.4-18.5-24z"
          fill={`url(#${id("skin")})`}
        />
        {/* Form shadow down the shaded side. */}
        <path
          d="M70.5 32.5c5 4 8 10.8 8 18.5v7.5c0 14.6-8.2 24-18.5 24-1.7 0-3.4-.3-5-.8 10.6-2.2 17.9-12 17.9-25z"
          fill={C.skinShade}
          opacity="0.4"
        />

        <g fill={`url(#${id("hair")})`}>
          {HAIR_FRINGE.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g fill={C.hairMid} opacity="0.45">
          <circle cx="52" cy="25" r="5" />
          <circle cx="64" cy="25.5" r="5" />
        </g>

        {/* Brows */}
        <g stroke={C.browDark} strokeWidth="2.9" strokeLinecap="round" fill="none">
          <path d="M44 45c2.8-2.8 8.4-3.2 11.6-1.3" />
          <path d="M64.4 43.7c3.2-1.9 8.8-1.5 11.6 1.3" />
        </g>

        {/* Eyes */}
        <g>
          <ellipse cx="50" cy="54.5" rx="6" ry="5" fill="#FFFFFF" />
          <ellipse cx="70" cy="54.5" rx="6" ry="5" fill="#FFFFFF" />
          <circle cx="50.8" cy="55" r="3.8" fill={C.iris} />
          <circle cx="70.8" cy="55" r="3.8" fill={C.iris} />
          <circle cx="50.8" cy="55" r="1.8" fill={C.pupil} />
          <circle cx="70.8" cy="55" r="1.8" fill={C.pupil} />
          <circle cx="49.4" cy="53.4" r="1.3" fill="#FFFFFF" />
          <circle cx="69.4" cy="53.4" r="1.3" fill="#FFFFFF" />
        </g>
        <g stroke={C.pupil} strokeWidth="2.1" strokeLinecap="round" fill="none">
          <path d="M44.4 52.4c2.8-2.6 8.4-2.8 11.4-.5" />
          <path d="M64.4 51.9c3-2.3 8.6-2.1 11.4.5" />
        </g>

        {/* Glasses */}
        <g
          fill="#BFD8D4"
          fillOpacity="0.16"
          stroke={C.frame}
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <rect x="38.5" y="45.5" width="23" height="19" rx="8.5" />
          <rect x="62.5" y="45.5" width="23" height="19" rx="8.5" />
        </g>
        <g fill="none" stroke={C.frame} strokeWidth="2.2" strokeLinecap="round">
          {/* Bridge, then the temples running back to each ear. */}
          <path d="M59.6 51c1.8-1.3 3.6-1.3 5.4 0" />
          <path d="M38.5 51 33 53" />
          <path d="M85.5 51 91 53" />
        </g>
        {/* A thin specular streak across each lens, not a wedge. */}
        <g
          stroke="#FFFFFF"
          strokeOpacity="0.34"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M45 49.5 41 58" />
          <path d="M69 49.5 65 58" />
        </g>

        {/* Nose */}
        <path
          d="M59.6 61.5c-.7 3.2-2.2 5-4.3 5.6"
          fill="none"
          stroke={C.skinShade}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Smile, with teeth */}
        <path
          d="M50 70.5c3.4-1.8 16.6-1.8 20 0-1.8 6.8-6.6 10-10 10s-8.2-3.2-10-10z"
          fill={C.mouth}
        />
        <path
          d="M52.4 71.2c3.2-1.1 13.2-1.1 16 0-1.1 2.9-4.6 4.1-8 4.1s-6.9-1.2-8-4.1z"
          fill="#FFFFFF"
        />
        <path
          d="M54.6 78.6c1.8 1.3 3.7 2 5.4 2s3.6-.7 5.4-2c-1.8.8-3.6 1.2-5.4 1.2s-3.6-.4-5.4-1.2z"
          fill={C.lip}
          opacity="0.75"
        />
      </g>

      {/* Inner rim — the same lighting the app icons get. */}
      <circle
        cx="60"
        cy="60"
        r="59"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
    </svg>
  );
}
