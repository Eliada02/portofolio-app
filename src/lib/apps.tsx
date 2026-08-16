import type { AppId } from "@/lib/store";
import { AboutApp } from "@/components/apps/AboutApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { SkillsApp } from "@/components/apps/SkillsApp";
import { ContactApp } from "@/components/apps/ContactApp";
import { TerminalApp } from "@/components/apps/TerminalApp";
import {
  ContactsArt,
  FinderArt,
  NotesArt,
  SettingsArt,
  MailArt,
  TerminalArt,
} from "@/components/os/MacIcons";

export type AppMeta = {
  id: AppId;
  name: string;
  /** Full-bleed icon art; `AppIcon` clips it to the macOS squircle. */
  Art: React.ComponentType;
  Component: React.ComponentType;
  showInDock: boolean;
  /** Pinned to the iOS dock on mobile. Dock apps don't repeat in the grid. */
  iosDock?: boolean;
};

// Each app borrows the macOS icon whose job is closest to its own, so the
// dock reads like a real Mac dock at a glance.
export const APPS: AppMeta[] = [
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
];

export const APP_MAP: Record<AppId, AppMeta> = Object.fromEntries(
  APPS.map((a) => [a.id, a])
) as Record<AppId, AppMeta>;
