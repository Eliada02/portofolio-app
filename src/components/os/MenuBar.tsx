"use client";

import { Menubar } from "radix-ui";
import { Apple, Wifi, WifiOff } from "lucide-react";
import { useOS } from "@/lib/store";
import { APP_MAP, APPS } from "@/lib/apps";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { useTheme, type Theme } from "@/lib/theme";
import { profile } from "@/lib/data";
import { BatteryWidget } from "./BatteryWidget";
import { ControlCenter } from "./ControlCenter";
import {
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "./MenuPrimitives";

const githubUrl =
  profile.socials.find((s) => s.label === "GitHub")?.url ?? "https://github.com";

export function MenuBar() {
  const now = useClock();
  const windows = useOS((s) => s.windows);
  const wifi = useOS((s) => s.wifi);
  const openApp = useOS((s) => s.openApp);
  const closeApp = useOS((s) => s.closeApp);
  const focusApp = useOS((s) => s.focusApp);
  const minimizeApp = useOS((s) => s.minimizeApp);
  const minimizeAll = useOS((s) => s.minimizeAll);
  const toggleMaximize = useOS((s) => s.toggleMaximize);
  const setBooted = useOS((s) => s.setBooted);
  const { theme, setTheme } = useTheme();

  const frontmost = windows
    .filter((w) => !w.minimized)
    .sort((a, b) => b.z - a.z)[0];
  const activeApp = frontmost ? APP_MAP[frontmost.id] : null;
  const activeName = activeApp?.name ?? "Finder";

  const zoomFrontmost = () => {
    if (!frontmost) return;
    toggleMaximize(frontmost.id, {
      w: window.innerWidth,
      h: window.innerHeight,
    });
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {
      /* clipboard can be blocked; nothing useful to report from a menu */
    });
  };

  return (
    // The bar is the container; `Menubar.Root` holds only the menus. A
    // role="menubar" element may contain menu items and nothing else, so the
    // clock, the indicators and the backdrop all stay outside it.
    <div className="fixed inset-x-0 top-0 z-9999 flex h-7 items-center justify-between gap-2 px-2 text-[13px] text-white sm:px-3">
      {/* Chrome material: darker than the panels, so the bar reads as system
          UI rather than as another floating window. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/22 backdrop-blur-2xl backdrop-saturate-150"
      />

      <Menubar.Root
        aria-label="Main menu"
        className="flex min-w-0 items-center gap-0.5"
      >
        {/* Apple menu */}
        <Menubar.Menu>
          <MenuTrigger className="px-1.5">
            <Apple className="size-4 fill-white" strokeWidth={0} />
            <span className="sr-only">Apple menu</span>
          </MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => openApp("about")}>
              About This Developer
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => openApp("skills")}>
              System Settings…
            </MenuItem>
            <MenuItem onSelect={() => openApp("terminal")}>Terminal…</MenuItem>
            <MenuSeparator />
            <MenuRadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as Theme)}
            >
              <MenuRadioItem value="light">Light Appearance</MenuRadioItem>
              <MenuRadioItem value="dark">Dark Appearance</MenuRadioItem>
              <MenuRadioItem value="system">Match System</MenuRadioItem>
            </MenuRadioGroup>
            <MenuSeparator />
            <MenuItem
              onSelect={() => {
                minimizeAll();
                setBooted(false);
              }}
            >
              Restart…
            </MenuItem>
          </MenuContent>
        </Menubar.Menu>

        {/* Active application menu */}
        <Menubar.Menu>
          <MenuTrigger className="font-semibold">{activeName}</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => openApp("about")}>
              About {activeName}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              disabled={!frontmost}
              shortcut="Cmd H"
              onSelect={() => frontmost && minimizeApp(frontmost.id)}
            >
              Hide {activeName}
            </MenuItem>
            <MenuItem shortcut="Opt Cmd H" onSelect={minimizeAll}>
              Hide Others
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              disabled={!frontmost}
              shortcut="Cmd Q"
              onSelect={() => frontmost && closeApp(frontmost.id)}
            >
              Quit {activeName}
            </MenuItem>
          </MenuContent>
        </Menubar.Menu>

        <Menubar.Menu>
          <MenuTrigger className="hidden md:block">File</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => openApp("terminal")} shortcut="Cmd N">
              New Terminal Window
            </MenuItem>
            <MenuItem onSelect={() => openApp("projects")}>
              Open Projects
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              disabled={!frontmost}
              shortcut="Cmd W"
              onSelect={() => frontmost && closeApp(frontmost.id)}
            >
              Close Window
            </MenuItem>
          </MenuContent>
        </Menubar.Menu>

        <Menubar.Menu>
          <MenuTrigger className="hidden md:block">Edit</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => copy(profile.email)}>
              Copy Email Address
            </MenuItem>
            <MenuItem onSelect={() => copy(profile.phone)}>
              Copy Phone Number
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => openApp("contact")}>
              Compose Message…
            </MenuItem>
          </MenuContent>
        </Menubar.Menu>

        <Menubar.Menu>
          <MenuTrigger className="hidden md:block">View</MenuTrigger>
          <MenuContent>
            <MenuItem
              disabled={!frontmost}
              shortcut="Ctrl Cmd F"
              onSelect={zoomFrontmost}
            >
              {frontmost?.maximized ? "Exit Full Screen" : "Enter Full Screen"}
            </MenuItem>
            <MenuSeparator />
            <MenuRadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as Theme)}
            >
              <MenuRadioItem value="light">Light</MenuRadioItem>
              <MenuRadioItem value="dark">Dark</MenuRadioItem>
              <MenuRadioItem value="system">Auto</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menubar.Menu>

        <Menubar.Menu>
          <MenuTrigger className="hidden lg:block">Window</MenuTrigger>
          <MenuContent>
            <MenuItem
              disabled={windows.length === 0}
              onSelect={minimizeAll}
              shortcut="Cmd M"
            >
              Minimize All
            </MenuItem>
            <MenuSeparator />
            {windows.length === 0 ? (
              <MenuItem disabled>No Open Windows</MenuItem>
            ) : (
              windows.map((w) => (
                <MenuItem key={w.id} onSelect={() => focusApp(w.id)}>
                  {APP_MAP[w.id].name}
                </MenuItem>
              ))
            )}
          </MenuContent>
        </Menubar.Menu>

        <Menubar.Menu>
          <MenuTrigger className="hidden lg:block">Help</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => openApp("terminal")}>
              Portfolio Help (Terminal)
            </MenuItem>
            <MenuSeparator />
            {APPS.filter((a) => a.showInDock).map((app) => (
              <MenuItem key={app.id} onSelect={() => openApp(app.id)}>
                Open {app.name}
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuLinkItem href={githubUrl}>View Source on GitHub</MenuLinkItem>
          </MenuContent>
        </Menubar.Menu>
      </Menubar.Root>

      {/* Status area — indicators, not menus. */}
      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
        <BatteryWidget />
        {wifi ? (
          <Wifi className="size-4" aria-label="Wi-Fi on" />
        ) : (
          <WifiOff className="size-4 opacity-60" aria-label="Wi-Fi off" />
        )}
        <ControlCenter />
        <span className="hidden opacity-95 sm:inline" suppressHydrationWarning>
          {formatDate(now)}
        </span>
        <span className="tabular-nums" suppressHydrationWarning>
          {formatTime(now)}
        </span>
      </div>
    </div>
  );
}
