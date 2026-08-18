import type { SVGProps } from "react";
import { Mail } from "lucide-react";
// Named imports only. A namespace import (`import * as si`) plus dynamic
// lookup defeats tree-shaking and pulls all ~3,450 icons into the bundle.
import {
  siJavascript,
  siTypescript,
  siReact,
  siNextdotjs,
  siRedux,
  siTailwindcss,
  siMui,
  siHtml5,
  siCss,
  siNodedotjs,
  siNestjs,
  siExpress,
  siPostgresql,
  siMongodb,
  siDocker,
  siGit,
  siGithub,
  siSwagger,
  siTrello,
  siClickup,
  siFigma,
  siPostman,
  siShadcnui,
  siWhatsapp,
} from "simple-icons";
import { EXTRA_BRANDS } from "./brand-paths";

type Brand = { title: string; hex: string; path: string };

/**
 * Maps a skill / tool / social label to its brand mark. Most come from
 * simple-icons; Slack, LinkedIn, VS Code and Teams were pulled from that
 * registry on trademark request, so they live in EXTRA_BRANDS.
 *
 * Labels absent here render no icon — the right outcome for unbranded
 * entries like "SQL" or "REST APIs".
 */
const BRANDS: Record<string, Brand> = {
  JavaScript: siJavascript,
  TypeScript: siTypescript,
  React: siReact,
  "Next.js": siNextdotjs,
  "Redux Toolkit": siRedux,
  "Tailwind CSS": siTailwindcss,
  "Material UI": siMui,
  HTML5: siHtml5,
  // simple-icons ships the mark as plain "CSS"; the CV lists it as CSS3.
  CSS3: siCss,
  "Node.js": siNodedotjs,
  NestJS: siNestjs,
  "Express.js": siExpress,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  Docker: siDocker,
  Git: siGit,
  GitHub: siGithub,
  Swagger: siSwagger,
  Trello: siTrello,
  ClickUp: siClickup,
  Figma: siFigma,
  Postman: siPostman,
  "shadcn/ui": siShadcnui,
  WhatsApp: siWhatsapp,
  Slack: EXTRA_BRANDS.slack,
  LinkedIn: EXTRA_BRANDS.linkedin,
  "VS Code": EXTRA_BRANDS.visualstudiocode,
};

export function getBrand(label: string): Brand | null {
  return BRANDS[label] ?? null;
}

export function BrandIcon({
  label,
  colored = true,
  ...props
}: { label: string; colored?: boolean } & SVGProps<SVGSVGElement>) {
  const brand = getBrand(label);
  if (!brand) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      // Brand marks are monochrome paths; the colour is ours to set.
      fill={colored ? `#${brand.hex}` : "currentColor"}
      role="img"
      aria-hidden
      {...props}
    >
      <path d={brand.path} />
    </svg>
  );
}

/** Social links: a brand mark where one exists, otherwise the mail glyph. */
export function SocialIcon({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return getBrand(label) ? (
    <BrandIcon label={label} className={className} />
  ) : (
    <Mail className={className} />
  );
}
