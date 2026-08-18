import { useId } from "react";

/**
 * A drawn developer avatar — curly hair and glasses.
 *
 * Deliberately stylised rather than semi-realistic. An SVG face that reaches
 * for realism lands in the uncanny valley at exactly the sizes this is used
 * at (40–120px); a flat, geometric mark in the Memoji idiom stays legible
 * when it's small and doesn't get strange when it's large.
 *
 * Gradient ids are namespaced with `useId` because this renders more than
 * once per page — duplicate ids would make every instance resolve to the
 * first one's gradients.
 */
export function Avatar({ className = "size-24" }: { className?: string }) {
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
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#DE3163" />
          <stop offset="1" stopColor="#9F2B68" />
        </linearGradient>
        <linearGradient id={id("skin")} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#F6D2B8" />
          <stop offset="1" stopColor="#E3B393" />
        </linearGradient>
        <linearGradient id={id("hair")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#4A2C22" />
          <stop offset="1" stopColor="#2C1810" />
        </linearGradient>
        <linearGradient id={id("top")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2D2BD" />
          <stop offset="1" stopColor="#DDB79C" />
        </linearGradient>
        {/* Keeps the hair and shoulders inside the circle. */}
        <clipPath id={id("clip")}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id("clip")})`}>
        <rect width="120" height="120" fill={`url(#${id("bg")})`} />
        {/* Soft top-left key light, the way macOS lights its art. */}
        <circle cx="34" cy="26" r="46" fill="#FFFFFF" opacity="0.12" />

        {/* Shoulders */}
        <path
          d="M18 120c0-19.9 18.8-33 42-33s42 13.1 42 33z"
          fill={`url(#${id("top")})`}
        />
        <path
          d="M60 87c-5.6 0-10.9.8-15.7 2.2L60 103l15.7-13.8A57 57 0 0 0 60 87z"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* Hair mass behind the face */}
        <path
          d="M26 56c0-20.4 15.2-35 34-35s34 14.6 34 35c0 9-1.4 16.6-4 22.5-1.6 3.6-6 3-6.4-.9C82.4 62 78 55 60 55s-22.4 7-23.6 22.6c-.3 3.9-4.8 4.5-6.4.9-2.6-5.9-4-13.5-4-22.5z"
          fill={`url(#${id("hair")})`}
        />

        {/* Ears */}
        <ellipse cx="30.5" cy="60" rx="4.6" ry="6.2" fill={`url(#${id("skin")})`} />
        <ellipse cx="89.5" cy="60" rx="4.6" ry="6.2" fill={`url(#${id("skin")})`} />

        {/* Face */}
        <path
          d="M33 52c0-14.9 12.1-25 27-25s27 10.1 27 25v10c0 16.6-12.1 28-27 28S33 78.6 33 62z"
          fill={`url(#${id("skin")})`}
        />

        {/* Curls — a scattered ring of circles reads as coils at every size,
            where drawn strands turn to mush below ~48px. */}
        <g fill={`url(#${id("hair")})`}>
          {[
            [34, 34, 11], [48, 24, 12], [62, 21, 12.5], [76, 25, 11.5],
            [88, 36, 10.5], [93, 50, 9], [27, 48, 9.5], [24, 62, 8],
            [96, 62, 8], [30, 74, 7], [90, 74, 7], [40, 20, 8], [70, 18, 8.5],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        {/* Highlight curls, so the mass isn't a flat silhouette. */}
        <g fill="#6B4132" opacity="0.55">
          {[[45, 26, 5], [64, 23, 5.5], [82, 33, 4.5], [31, 43, 4]].map(
            ([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} />
            )
          )}
        </g>

        {/* Brows */}
        <g stroke="#3B241B" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M43 54.5c3-2.2 7.5-2.2 10.6-.4" />
          <path d="M66.4 54.1c3.1-1.8 7.6-1.8 10.6.4" />
        </g>

        {/* Eyes */}
        <g fill="#2C1810">
          <circle cx="48.5" cy="62.5" r="3.2" />
          <circle cx="71.5" cy="62.5" r="3.2" />
        </g>
        <g fill="#FFFFFF" opacity="0.9">
          <circle cx="49.6" cy="61.4" r="1.1" />
          <circle cx="72.6" cy="61.4" r="1.1" />
        </g>

        {/* Glasses — drawn over the eyes, with a highlight on each lens. */}
        <g
          fill="none"
          stroke="#241019"
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <rect x="37" y="54" width="23" height="17" rx="7" fill="#FFFFFF" fillOpacity="0.16" />
          <rect x="60" y="54" width="23" height="17" rx="7" fill="#FFFFFF" fillOpacity="0.16" />
          <path d="M60 61.5h0" />
          <path d="M33.5 57.5 37 59" />
          <path d="M86.5 57.5 83 59" />
        </g>
        <g fill="#FFFFFF" opacity="0.4">
          <path d="M41 57.5 46.5 57.5 40.5 67 39 63z" />
          <path d="M64 57.5 69.5 57.5 63.5 67 62 63z" />
        </g>

        {/* Nose and mouth */}
        <path
          d="M59 68.5c-.6 2.6-1.8 4-3.4 4.4"
          fill="none"
          stroke="#C9906E"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M52.5 79c2.2 2.6 5 3.9 7.9 3.9s5.7-1.3 7.9-3.9"
          fill="none"
          stroke="#A85B54"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </g>

      {/* Inner rim — the same lighting the app icons get. */}
      <circle
        cx="60"
        cy="60"
        r="59"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.28"
        strokeWidth="2"
      />
    </svg>
  );
}
