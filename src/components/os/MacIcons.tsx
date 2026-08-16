/**
 * Hand-drawn app icons in the macOS visual language — Contacts, Finder,
 * Notes, System Settings, Mail and Terminal.
 *
 * Each one paints the full 100×100 tile including its own background; the
 * squircle clip, gloss and shadow are applied by `AppIcon`, so these never
 * round their own corners.
 *
 * Gradient ids are global to the document. They're duplicated whenever an
 * icon renders twice (dock + desktop + home screen) — harmless, because
 * every copy of a given id defines the exact same gradient.
 */

const SVG_PROPS = {
  viewBox: "0 0 100 100",
  className: "size-full",
  "aria-hidden": true,
} as const;

/** About Me — Contacts: a bound address book, person on the open page. */
export function ContactsArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="mac-contacts-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCF7EF" />
          <stop offset="1" stopColor="#E4D7C5" />
        </linearGradient>
        <linearGradient id="mac-contacts-spine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A07958" />
          <stop offset="1" stopColor="#6B4B34" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#mac-contacts-page)" />
      <rect width="27" height="100" fill="url(#mac-contacts-spine)" />
      {/* Binder rings, punched through the spine. */}
      {[16, 32, 48, 64, 80].map((y) => (
        <rect
          key={y}
          x="6"
          y={y - 2.5}
          width="15"
          height="5"
          rx="2.5"
          fill="#F6EBDA"
          opacity="0.92"
        />
      ))}
      {/* Page gutter shadow, just right of the binding. */}
      <rect x="27" width="7" height="100" fill="#000" opacity="0.07" />
      <g fill="#A1958A">
        <circle cx="62" cy="40" r="12.5" />
        <path d="M41 84c0-11.6 9.4-20 21-20s21 8.4 21 20z" />
      </g>
    </svg>
  );
}

/** Projects — the Finder face: split tile, two eyes and a wide smile. */
export function FinderArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="mac-finder-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4FA5F7" />
          <stop offset="1" stopColor="#1C74D8" />
        </linearGradient>
        <linearGradient id="mac-finder-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4FAFF" />
          <stop offset="1" stopColor="#D8E9FA" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#mac-finder-left)" />
      <rect x="50" width="50" height="100" fill="url(#mac-finder-right)" />
      {/* Seam — the fold between the two halves of the face. */}
      <rect x="49" width="2" height="100" fill="#0F4E9C" opacity="0.18" />
      <g fill="#17457F">
        <ellipse cx="34" cy="43" rx="4.6" ry="6.6" />
        <ellipse cx="66" cy="43" rx="4.6" ry="6.6" />
      </g>
      <path
        d="M24 60c8 15 44 15 52 0"
        fill="none"
        stroke="#17457F"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Experience — Notes: yellow header band over a ruled page. */
export function NotesArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="mac-notes-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFDC5E" />
          <stop offset="1" stopColor="#F5B838" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="#FFFDF6" />
      <rect width="100" height="26" fill="url(#mac-notes-band)" />
      <rect y="26" width="100" height="2" fill="#000" opacity="0.07" />
      <g fill="#D8D1C2">
        {[42, 56, 70, 84].map((y, i) => (
          // The last line stops short, the way a paragraph ends.
          <rect key={y} x="14" y={y} width={i === 3 ? 46 : 72} height="4" rx="2" />
        ))}
      </g>
    </svg>
  );
}

/** Skills — System Settings: two graphite gears. */
export function SettingsArt() {
  const gear = (cx: number, cy: number, r: number, hole: number, teeth: number) => {
    const toothW = r * 0.42;
    const toothH = r * 0.5;
    return (
      <g>
        {Array.from({ length: teeth }, (_, i) => (
          <rect
            key={i}
            x={cx - toothW / 2}
            y={cy - r - toothH * 0.55}
            width={toothW}
            height={toothH}
            rx={toothW * 0.35}
            transform={`rotate(${(360 / teeth) * i} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={r} />
        {/* Punch the hub back out to the tile background. */}
        <circle cx={cx} cy={cy} r={hole} fill="url(#mac-settings-bg)" />
      </g>
    );
  };

  return (
    <svg {...SVG_PROPS}>
      <defs>
        {/* userSpaceOnUse so the gear hubs can reuse this gradient and land on
            exactly the background colour behind them. */}
        <linearGradient
          id="mac-settings-bg"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="100"
        >
          <stop offset="0" stopColor="#9BA1A9" />
          <stop offset="1" stopColor="#5C6169" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#mac-settings-bg)" />
      <g fill="#EEF1F4">
        {gear(41, 42, 21, 8, 9)}
        {gear(72, 71, 13, 5, 8)}
      </g>
    </svg>
  );
}

/** Contact — Mail: a white envelope on Apple blue. */
export function MailArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="mac-mail-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5CB2FB" />
          <stop offset="1" stopColor="#1370E4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#mac-mail-bg)" />
      <rect x="15" y="29" width="70" height="42" rx="7" fill="#FFFFFF" />
      {/* The flap crease, folded down to the middle of the envelope. */}
      <path
        d="M18 33.5 50 57 82 33.5"
        fill="none"
        stroke="#AFC8E0"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Terminal — a dark shell window with a prompt. */
export function TerminalArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="mac-terminal-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B3B3F" />
          <stop offset="1" stopColor="#121214" />
        </linearGradient>
        <linearGradient id="mac-terminal-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#83838B" />
          <stop offset="1" stopColor="#63636A" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#mac-terminal-bg)" />
      <rect width="100" height="19" fill="url(#mac-terminal-bar)" />
      <g fill="#D5D5DA">
        <circle cx="12" cy="9.5" r="3" />
        <circle cx="23" cy="9.5" r="3" />
        <circle cx="34" cy="9.5" r="3" />
      </g>
      <path
        d="M23 41 39 54 23 67"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="46" y="63" width="31" height="6.5" rx="3.25" fill="#FFFFFF" />
    </svg>
  );
}
