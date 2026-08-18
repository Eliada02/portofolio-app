"use client";

import { MousePointerClick, PanelBottom, Sparkles } from "lucide-react";
import { profile } from "@/lib/data";
import { APPS } from "@/lib/apps";
import { useOS } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";
import { Avatar } from "@/components/Avatar";
import { AppIcon } from "@/components/os/AppIcon";
import { HeroActions } from "@/components/HeroActions";

/**
 * START HERE — the plain-language answer to "what am I looking at?".
 *
 * The desktop metaphor is the portfolio's strongest idea and its biggest
 * usability risk: a recruiter who doesn't realise the icons are clickable sees
 * a wallpaper. This window states the value proposition in one line, explains
 * the interface in two, and puts the three most likely next actions in reach.
 */
export function WelcomeApp() {
  const openApp = useOS((s) => s.openApp);
  const isMobile = useIsMobile();

  const howTo = isMobile
    ? {
        icon: <PanelBottom className="size-4 shrink-0" />,
        text: "Tap any app icon to open it as a sheet. Drag the handle at the top of a sheet down to close it.",
      }
    : {
        icon: <MousePointerClick className="size-4 shrink-0" />,
        text: "Double-click a desktop icon, or single-click anything in the Dock at the bottom. Windows drag, resize and stack like the real thing.",
      };

  return (
    <div className="scroll-overlay h-full overflow-y-auto">
      <div className="px-5 py-6 @sm:px-8 @sm:py-8">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 shrink-0 rounded-full shadow-lg ring-2 ring-border @sm:size-20" />
          <div className="min-w-0">
            {/* Purpose pill — says what the interface is before it's explored. */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3" />
              Interactive macOS Portfolio
            </span>
            <h1 className="mt-2 text-balance text-xl font-semibold tracking-tight @sm:text-2xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-balance text-sm font-medium text-muted-foreground @sm:text-base">
              {profile.headline}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
          {howTo.icon}
          <p className="min-w-0">{howTo.text}</p>
        </div>

        <HeroActions size="lg" className="mt-5" />

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          What&apos;s inside
        </h2>
        <ul className="mt-3 grid gap-2 @sm:grid-cols-2">
          {APPS.filter((a) => a.id !== "welcome").map((app) => (
            <li key={app.id}>
              <button
                type="button"
                onClick={() => openApp(app.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppIcon art={app.Art} className="size-9 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {app.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {APP_BLURB[app.id] ?? "Open"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted-foreground">
          Based in {profile.location}. Every app here is real — the terminal
          takes commands, and the code editor shows this site&apos;s own source.
        </p>
      </div>
    </div>
  );
}

/** One line each, so the list explains itself rather than just naming apps. */
const APP_BLURB: Record<string, string> = {
  about: "Who I am, background and links",
  projects: "Selected work, with live and source links",
  experience: "Roles, courses and education",
  skills: "The stack, grouped by where it lives",
  contact: "Email, WhatsApp and socials",
  terminal: "A real shell — try 'help'",
  code: "This portfolio's own source",
  design: "The design system behind it",
};
