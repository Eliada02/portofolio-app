"use client";

import { useOS } from "@/lib/store";
import { APP_MAP } from "@/lib/apps";
import { StatusBar } from "./StatusBar";
import { HomeScreen } from "./HomeScreen";
import { MobileSheet } from "./MobileSheet";
import { motion } from "motion/react";

/**
 * The phone shell. Only one app is ever on screen: opening an app presents it
 * as an iOS 18 modal sheet over the home screen, and dismissing the sheet
 * sends it back to the background (minimised, not closed — as iOS does).
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
      <StatusBar />

      <div className="relative min-h-0 flex-1">
        {/* The home screen recedes into the card stack behind the sheet —
            the depth cue iOS uses to say "this is presented over that". */}
        <motion.div
          animate={{ scale: meta ? 0.92 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="absolute inset-0 origin-top overflow-hidden rounded-[2.25rem]"
        >
          <HomeScreen onOpen={openApp} />
        </motion.div>

        <MobileSheet
          open={!!meta}
          title={meta?.name ?? ""}
          onDismiss={goHome}
        >
          {Content && <Content />}
        </MobileSheet>
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
    <div className="relative z-30 flex h-8 shrink-0 items-end justify-center pb-[max(0.35rem,env(safe-area-inset-bottom))]">
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
        <span className="h-1 w-32 rounded-full bg-white/70 transition-colors" />
      </motion.button>
    </div>
  );
}
