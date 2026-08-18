/**
 * Desktop shortcut art — the developer tools, plus a Finder folder.
 *
 * Like `MacIcons`, each tile paints the full 100x100 including its own
 * background; `AppIcon` applies the squircle, gloss and rim. The folder is the
 * exception: folders aren't app tiles, so `FolderArt` paints on transparency
 * and is rendered unclipped.
 *
 * The three brand marks come from the registry in `brand-paths` /
 * `simple-icons` rather than being re-traced here — they're already in the
 * bundle, and an official path beats an approximation.
 */
import { getBrand } from "@/components/BrandIcon";

const SVG_PROPS = {
  viewBox: "0 0 100 100",
  className: "size-full",
  "aria-hidden": true,
} as const;

/** Places a 24x24 brand mark centred on the tile at the given size. */
function BrandMark({
  label,
  size,
  fill,
}: {
  label: string;
  size: number;
  fill: string;
}) {
  const brand = getBrand(label);
  if (!brand) return null;
  const offset = (100 - size) / 2;

  return (
    <svg x={offset} y={offset} width={size} height={size} viewBox="0 0 24 24">
      <path d={brand.path} fill={fill} />
    </svg>
  );
}

/** VS Code — the ribbon mark, white on the product blue. */
export function VSCodeArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="tool-vscode-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FA7EE" />
          <stop offset="1" stopColor="#0065A9" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#tool-vscode-bg)" />
      <BrandMark label="VS Code" size={62} fill="#FFFFFF" />
    </svg>
  );
}

/** Figma — the five-shape mark on the dark tile the Mac app ships with. */
export function FigmaArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="tool-figma-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B3B3F" />
          <stop offset="1" stopColor="#1E1E20" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#tool-figma-bg)" />
      {/* The mark is 24 wide by 36 tall; scaled to 60 tall and centred. */}
      <g transform="translate(30 20) scale(1.6667)">
        <path d="M0 6a6 6 0 0 1 6-6h6v12H6a6 6 0 0 1-6-6z" fill="#F24E1E" />
        <path d="M12 0h6a6 6 0 0 1 0 12h-6z" fill="#FF7262" />
        <path d="M0 18a6 6 0 0 1 6-6h6v12H6a6 6 0 0 1-6-6z" fill="#A259FF" />
        <circle cx="18" cy="18" r="6" fill="#1ABCFE" />
        <path d="M0 30a6 6 0 0 1 6-6h6v6a6 6 0 1 1-12 0z" fill="#0ACF83" />
      </g>
    </svg>
  );
}

/** GitHub — the Octocat mark on GitHub's near-black. */
export function GitHubArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="tool-github-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A4048" />
          <stop offset="1" stopColor="#1B1F24" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#tool-github-bg)" />
      <BrandMark label="GitHub" size={62} fill="#FFFFFF" />
    </svg>
  );
}

/**
 * A Finder folder. Painted on transparency and rendered unclipped — a folder
 * is a document, not an app tile, so squircling it would be wrong.
 */
export function FolderArt() {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <defs>
        <linearGradient id="tool-folder-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FC5F5" />
          <stop offset="1" stopColor="#4FA3E3" />
        </linearGradient>
        <linearGradient id="tool-folder-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD6FA" />
          <stop offset="1" stopColor="#5DAEE8" />
        </linearGradient>
      </defs>
      {/* Back panel, with the tab that reads as the folder's index flap. */}
      <path
        d="M6 26a7 7 0 0 1 7-7h22.6a7 7 0 0 1 4.7 1.8l5.1 4.6a7 7 0 0 0 4.7 1.8H87a7 7 0 0 1 7 7v40a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7z"
        fill="url(#tool-folder-back)"
      />
      {/* Front panel sits slightly lower, leaving the back edge visible. */}
      <path
        d="M6 37a7 7 0 0 1 7-7h74a7 7 0 0 1 7 7v37a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7z"
        fill="url(#tool-folder-front)"
      />
      {/* Hairline along the front's top edge — the light catching the fold. */}
      <path
        d="M13 30.6h74a6.4 6.4 0 0 1 6.4 6.4H6.6A6.4 6.4 0 0 1 13 30.6z"
        fill="#FFFFFF"
        opacity="0.35"
      />
    </svg>
  );
}

/** WhatsApp — the mark on the product green. */
export function WhatsAppArt() {
  return (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="tool-whatsapp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4AE168" />
          <stop offset="1" stopColor="#1FA855" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#tool-whatsapp-bg)" />
      <BrandMark label="WhatsApp" size={62} fill="#FFFFFF" />
    </svg>
  );
}

/**
 * A Markdown document. Painted on transparency and rendered unclipped, like
 * the folder — a file has its own page silhouette, not an app tile.
 */
export function MarkdownFileArt() {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <defs>
        <linearGradient id="tool-md-page" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E7E2DC" />
        </linearGradient>
      </defs>
      {/* Page with the corner turned down. */}
      <path
        d="M18 8h40l24 24v56a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"
        fill="url(#tool-md-page)"
      />
      <path d="M58 8l24 24H64a6 6 0 0 1-6-6z" fill="#C9C2B9" />
      {/* Ruled lines, with the top one short like a heading. */}
      <g fill="#B9B2A9">
        <rect x="24" y="44" width="30" height="5" rx="2.5" />
        <rect x="24" y="56" width="46" height="4" rx="2" />
        <rect x="24" y="66" width="46" height="4" rx="2" />
        <rect x="24" y="76" width="32" height="4" rx="2" />
      </g>
      {/* The cerise tab that marks it as the one to read first. */}
      <rect x="12" y="40" width="6" height="26" rx="3" fill="#DE3163" />
    </svg>
  );
}
