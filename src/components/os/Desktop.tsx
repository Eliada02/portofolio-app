"use client";

import { useEffect } from "react";
import { useOS } from "@/lib/store";
import { APPS } from "@/lib/apps";
import { useIsMobile } from "@/lib/useMediaQuery";
import { MenuBar } from "./MenuBar";
import { AppIcon, SquircleDefs } from "./AppIcon";
import { Dock } from "./Dock";
import { Window } from "./Window";
import { BootScreen } from "./BootScreen";
import { MobileShell } from "./mobile/MobileShell";
import { AnimatePresence } from "motion/react";

export function Desktop() {
  const booted = useOS((s) => s.booted);
  const isMobile = useIsMobile();

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none">
      <SquircleDefs />

      {/* Wallpaper — painted from the brand pinks rather than a photo, so it
          scales to any viewport and costs nothing to load. */}
      <div className="absolute inset-0 -z-10 bg-brand-ink">
        {/* Cerise and magenta up top, sand warming the floor. */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#de3163_0%,transparent_45%),radial-gradient(circle_at_80%_25%,#9f2b68_0%,transparent_42%),radial-gradient(circle_at_50%_95%,#f2d2bd_0%,transparent_52%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30" />
      </div>

      {/* The two shells are genuinely different interaction models, not one
          layout at two widths — so they're separate trees over shared state. */}
      {booted && (isMobile ? <MobileShell /> : <DesktopShell />)}

      {!booted && <BootScreen />}
    </div>
  );
}

function DesktopShell() {
  const windows = useOS((s) => s.windows);
  const openApp = useOS((s) => s.openApp);
  const syncViewport = useOS((s) => s.syncViewport);

  // Keep windows inside the viewport when it resizes or the device rotates.
  useEffect(() => {
    const onResize = () => syncViewport(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [syncViewport]);

  return (
    <>
      <MenuBar />

      {/* Desktop shortcut icons, down the right edge */}
      <div className="absolute right-4 top-10 flex flex-col gap-4">
        {APPS.filter((a) => a.showInDock).map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => openApp(app.id)}
            onClick={(e) => {
              // Keyboard activation reports detail 0 — treat it as open.
              if (e.detail === 0) openApp(app.id);
            }}
            className="group flex w-16 flex-col items-center gap-1"
            title={`Open ${app.name}`}
          >
            <AppIcon
              app={app}
              className="size-12 transition group-hover:scale-105 group-active:scale-95"
            />
            <span className="rounded px-1 text-center text-[11px] leading-tight font-medium text-white/90 drop-shadow group-hover:bg-brand-cerise/75">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {windows.map((w) => (
          <Window key={w.id} win={w} />
        ))}
      </AnimatePresence>

      <Dock />
    </>
  );
}
