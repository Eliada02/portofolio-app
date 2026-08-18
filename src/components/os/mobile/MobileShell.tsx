"use client";

import { useRef } from "react";
import { ChevronUp } from "lucide-react";
import { useOS } from "@/lib/store";
import { APP_MAP } from "@/lib/apps";
import { StatusBar } from "./StatusBar";
import { HomeScreen } from "./HomeScreen";
import { MobileSheet } from "./MobileSheet";
import { motion } from "motion/react";

/** Past either of these, a drag up from the bottom bar counts as "open". */
const REOPEN_OFFSET = 40;
const REOPEN_VELOCITY = 350;

/**
 * The phone shell. Only one app is ever on screen: opening an app presents it
 * as an iOS 18 modal sheet over the home screen, and dismissing the sheet
 * sends it back to the background (minimised, not closed — as iOS does).
 *
 * The two vertical gestures are symmetric: drag the sheet's grabber down to
 * put an app away, drag up from the bottom bar to bring the last one back.
 */
export function MobileShell() {
  const windows = useOS((s) => s.windows);
  const openApp = useOS((s) => s.openApp);
  const focusApp = useOS((s) => s.focusApp);
  // Home backgrounds *every* app — minimising just the top one would reveal
  // whatever was behind it instead of the home screen.
  const goHome = useOS((s) => s.minimizeAll);

  const byDepth = [...windows].sort((a, b) => b.z - a.z);
  const active = byDepth.find((w) => !w.minimized);
  // The most recently used app that's currently in the background: what a
  // swipe up from the bottom brings back.
  const backgrounded = byDepth.find((w) => w.minimized);

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
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-0 origin-top overflow-hidden rounded-[2.25rem]"
        >
          <HomeScreen onOpen={openApp} />
        </motion.div>

        <MobileSheet open={!!meta} title={meta?.name ?? ""} onDismiss={goHome}>
          {Content && <Content />}
        </MobileSheet>
      </div>

      <HomeIndicator
        active={!!meta}
        onHome={goHome}
        reopenLabel={backgrounded ? APP_MAP[backgrounded.id].name : null}
        onReopen={() => backgrounded && focusApp(backgrounded.id)}
      />
    </div>
  );
}

interface HomeIndicatorProps {
  /** True while an app sheet is presented. */
  active: boolean;
  onHome: () => void;
  /** Name of the backgrounded app a swipe up would restore, if any. */
  reopenLabel: string | null;
  onReopen: () => void;
}

function HomeIndicator({
  active,
  onHome,
  reopenLabel,
  onReopen,
}: HomeIndicatorProps) {
  // A drag ends with a click on the same element; without this guard a
  // half-hearted nudge of the pill would switch apps on release.
  const dragged = useRef(false);
  const canReopen = !active && reopenLabel !== null;
  // The pill is a gesture surface whenever either direction means something.
  const draggable = active || canReopen;

  return (
    <div className="relative z-30 flex h-10 shrink-0 flex-col items-center justify-end gap-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      {canReopen && (
        <motion.span
          aria-hidden
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="pointer-events-none flex items-center gap-1 text-[10px] font-medium text-foreground/55"
        >
          <ChevronUp className="size-3" />
          {reopenLabel}
        </motion.span>
      )}

      <motion.button
        type="button"
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          if (active) onHome();
          else if (canReopen) onReopen();
        }}
        drag={draggable ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.35}
        dragMomentum={false}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          const flickedUp =
            info.offset.y < -REOPEN_OFFSET || info.velocity.y < -REOPEN_VELOCITY;
          if (!flickedUp) return;
          // Up means "away" while an app is open, and "bring it back" from home.
          if (active) onHome();
          else if (canReopen) onReopen();
        }}
        aria-label={
          active
            ? "Go to home screen"
            : canReopen
              ? `Swipe up to reopen ${reopenLabel}`
              : "Home"
        }
        disabled={!draggable}
        className="flex h-5 w-40 touch-none items-end justify-center pb-1"
      >
        <span className="h-1 w-32 rounded-full bg-foreground/45" />
      </motion.button>
    </div>
  );
}
