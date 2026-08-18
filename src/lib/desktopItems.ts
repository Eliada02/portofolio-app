import type { AppId } from "@/lib/store";
import { whatsappUrl } from "@/lib/contact";
import { profile } from "@/lib/data";
import {
  VSCodeArt,
  FigmaArt,
  GitHubArt,
  FolderArt,
  WhatsAppArt,
  MarkdownFileArt,
} from "@/components/os/ToolIcons";

/**
 * What sits on the desktop itself.
 *
 * Deliberately *not* the dock apps: repeating the dock on the desktop is
 * clutter, and a real Mac desktop holds the things the dock doesn't — tools,
 * folders and aliases. The portfolio apps stay one click away in the dock.
 */
export type DesktopItem = {
  id: string;
  label: string;
  /** Full-bleed 100x100 art. */
  Art: React.ComponentType;
  /**
   * App tiles get the squircle, gloss and rim. Folders and documents don't —
   * they're their own silhouette, so they render unclipped with a shadow.
   */
  shape: "tile" | "free";
  /** Open an app in a window, or follow a link off-site. */
  target: { app: AppId } | { href: string };
  /** macOS badges an alias with a small arrow; we badge outbound links. */
  alias?: boolean;
};

const githubUrl =
  profile.socials.find((s) => s.label === "GitHub")?.url ??
  "https://github.com";

export const DESKTOP_ITEMS: DesktopItem[] = [
  {
    // Top of the stack, and a document rather than a tile, so it reads as
    // "open me first" instead of as one more app.
    id: "start-here",
    label: "START HERE.md",
    Art: MarkdownFileArt,
    shape: "free",
    target: { app: "welcome" },
  },
  {
    id: "vscode",
    label: "VS Code",
    Art: VSCodeArt,
    shape: "tile",
    target: { app: "code" },
  },
  {
    id: "figma",
    label: "Figma",
    Art: FigmaArt,
    shape: "tile",
    target: { app: "design" },
  },
  {
    // An alias to the real profile rather than a mock GitHub client: there is
    // no repo data to render offline, and a window full of invented commits
    // would be worse than the link it stands in for.
    id: "github",
    label: "GitHub",
    Art: GitHubArt,
    shape: "tile",
    target: { href: githubUrl },
    alias: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    Art: WhatsAppArt,
    shape: "tile",
    target: { href: whatsappUrl },
    alias: true,
  },
  {
    id: "projects-folder",
    label: "Projects",
    Art: FolderArt,
    shape: "free",
    target: { app: "projects" },
  },
];
