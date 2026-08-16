"use client";

import { useOS } from "@/lib/store";
import { APP_MAP } from "@/lib/apps";
import { StatusBar } from "./StatusBar";
import { HomeScreen } from "./HomeScreen";
import { motion, AnimatePresence } from "motion/react";

/**
 * The phone shell. Unlike the desktop, only one app is ever on screen: opening
 * an app pushes it over the home screen, and the home indicator sends it back
 * to the background (minimised, not closed — as iOS does).
 */
export function MobileShell() {
  const windows = useOS((s) => s.windows);
  const openApp = useOS((s) => s.openApp);
  // Home backgrounds *every* app — minimising just the top one would reveal
  // whatever was behind it instead of the home screen.
  const goHome = useOS((s) => s.minimizeAll);

  const active = windows
    .filter((w) => !w.minimized)
    .sort((a, b) => b.z - a.z)[0];
  const meta = active ? APP_MAP[active.id] : null;
  const Content = meta?.Component;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <StatusBar tone={meta ? "dark" : "light"} />

      <div className="relative min-h-0 flex-1">
        {/* Home screen sits underneath and recedes slightly while an app is
            open, the way iOS parallaxes it behind the app. */}
        <motion.div
          animate={{ scale: meta ? 0.94 : 1, opacity: meta ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="absolute inset-0"
        >
          <HomeScreen onOpen={openApp} />
        </motion.div>

        <AnimatePresence>
          {meta && Content && (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.86 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              // Container queries let the apps lay out against the app frame.
              className="@container absolute inset-0 overflow-hidden bg-background"
            >
              <Content />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HomeIndicator onHome={goHome} active={!!meta} />
    </div>
  );
}

function HomeIndicator({
  onHome,
  active,
}: {
  onHome: () => void;
  active: boolean;
}) {
  return (
    <div className="relative z-50 flex h-8 shrink-0 items-end justify-center pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      <motion.button
        onClick={onHome}
        // Swiping up on the pill is the real gesture; tapping it works too.
        drag={active ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.35}
        onDragEnd={(_, info) => {
          if (info.offset.y < -24) onHome();
        }}
        aria-label={active ? "Go to home screen" : "Home"}
        disabled={!active}
        className="flex h-6 w-40 touch-none items-end justify-center pb-1.5"
      >
        <span
          className={`h-1 w-32 rounded-full transition-colors ${
            active ? "bg-foreground/40" : "bg-white/70"
          }`}
        />
      </motion.button>
    </div>
  );
}
