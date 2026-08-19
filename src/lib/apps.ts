import type { AppId } from "@/lib/store";
import { AboutApp } from "@/components/apps/AboutApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { SkillsApp } from "@/components/apps/SkillsApp";
import { ContactApp } from "@/components/apps/ContactApp";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { CodeApp } from "@/components/apps/CodeApp";
import { DesignApp } from "@/components/apps/DesignApp";
import { WelcomeApp } from "@/components/apps/WelcomeApp";
import {
  ContactsArt,
  FinderArt,
  NotesArt,
  SettingsArt,
  MailArt,
  TerminalArt,
} from "@/components/os/MacIcons";
import {
  VSCodeArt,
  FigmaArt,
  MarkdownFileArt,
} from "@/components/os/ToolIcons";

export type AppMeta = {
  id: AppId;
  name: string;
  /** Full-bleed icon art; `AppIcon` clips it to the macOS squircle. */
  Art: React.ComponentType;
  Component: React.ComponentType;
  /** Pinned to the macOS dock. Desktop shortcuts are a separate registry. */
  showInDock: boolean;
  /** Pinned to the iOS dock on mobile. Dock apps don't repeat in the grid. */
  iosDock?: boolean;
};

// Each app borrows the macOS icon whose job is closest to its own, so the
// dock reads like a real Mac dock at a glance.
export const APPS: AppMeta[] = [
  // First in the list so it leads the phone launcher and the Help menu — it
  // is the thing a first-time visitor should open before anything else.
  {
    id: "welcome",
    name: "START HERE",
    Art: MarkdownFileArt,
    Component: WelcomeApp,
    showInDock: false,
  },
  {
    id: "about",
    name: "About Me",
    Art: ContactsArt,
    Component: AboutApp,
    showInDock: true,
    iosDock: true,
  },
  {
    id: "projects",
    name: "Projects",
    Art: FinderArt,
    Component: ProjectsApp,
    showInDock: true,
    iosDock: true,
  },
  {
    id: "experience",
    name: "Experience",
    Art: NotesArt,
    Component: ExperienceApp,
    showInDock: true,
    iosDock: true,
  },
  {
    id: "skills",
    name: "Skills",
    Art: SettingsArt,
    Component: SkillsApp,
    showInDock: true,
  },
  {
    id: "contact",
    name: "Contact",
    Art: MailArt,
    Component: ContactApp,
    showInDock: true,
    iosDock: true,
  },
  {
    id: "terminal",
    name: "Terminal",
    Art: TerminalArt,
    Component: TerminalApp,
    showInDock: true,
  },
  // Tool apps. They're reached from the desktop shortcuts rather than the
  // dock, which stays reserved for the portfolio itself — but they're real
  // apps, so they window, minimise and appear on the phone launcher.
  {
    id: "code",
    name: "VS Code",
    Art: VSCodeArt,
    Component: CodeApp,
    showInDock: false,
  },
  {
    id: "design",
    name: "Figma",
    Art: FigmaArt,
    Component: DesignApp,
    showInDock: false,
  },
];

export const APP_MAP: Record<AppId, AppMeta> = Object.fromEntries(
  APPS.map((a) => [a.id, a])
) as Record<AppId, AppMeta>;
