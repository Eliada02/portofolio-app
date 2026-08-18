"use client";

import { useEffect, useState } from "react";
import { useOS } from "@/lib/store";
import { profile } from "@/lib/data";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { ChevronRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HelloMark, HELLO_DURATION } from "./HelloMark";
import { Avatar } from "@/components/Avatar";

/** Beat between the last stroke landing and the screen lifting away. */
const HOLD = 0.5;

export function BootScreen() {
  const setBooted = useOS((s) => s.setBooted);
  const openApp = useOS((s) => s.openApp);
  const reduced = useReducedMotion();
  const [greeted, setGreeted] = useState(false);
  const now = useClock();

  useEffect(() => {
    const ms = reduced ? 900 : (HELLO_DURATION + HOLD) * 1000;
    const t = setTimeout(() => setGreeted(true), ms);
    return () => clearTimeout(t);
  }, [reduced]);

  const enter = () => {
    setBooted(true);
    setTimeout(() => openApp("about"), 500);
  };

  return (
    <div className="fixed inset-0 z-10000 overflow-hidden">
      {/* Login sits underneath from the start, so lifting the hello screen
          reveals it already settled — the way macOS hands off after setup. */}
      <div className="absolute inset-0 bg-linear-to-b from-[#4a1b33] via-[#2a1220] to-[#160a11]">
        <div className="relative flex h-full flex-col items-center justify-center gap-5">
          {/* Click-anywhere-to-enter, behind the content so the real button
              still receives its own hover and clicks. */}
          <button
            onClick={enter}
            className="absolute inset-0 z-0 cursor-default"
            aria-label="Enter"
            tabIndex={-1}
          />
          {/* iOS lock screen leads with the clock; macOS leads with the user
              tile. Both are laid out in CSS so nothing flashes while a
              media-query hook settles. */}
          <div className="absolute inset-x-0 top-16 px-6 text-center md:hidden">
            <p className="text-base font-medium text-white/80">
              {formatDate(now)}
            </p>
            <p className="text-7xl font-semibold tabular-nums text-white">
              {formatTime(now)}
            </p>
          </div>

          {/* `relative` on each foreground child keeps it painted above the
              click-anywhere layer, which is a positioned z-0 sibling. */}
          <Avatar className="relative size-24 rounded-full shadow-2xl ring-4 ring-white/20 sm:size-28" />
          <div className="relative px-6 text-center">
            <h1 className="text-xl font-semibold text-white sm:text-2xl">
              {profile.name}
            </h1>
            <p className="text-sm text-white/60">{profile.role}</p>
          </div>

          <button
            onClick={enter}
            className="group relative mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 font-medium text-white backdrop-blur-md transition hover:bg-white/25"
          >
            Enter portfolio
            <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
          </button>

          {/* Swipe-up affordance on phones, click hint on desktop. */}
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 px-6 md:hidden">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <ChevronUp className="size-5 text-white/50" />
            </motion.div>
            <span className="text-xs text-white/50">Swipe up to open</span>
            <span className="h-1 w-32 rounded-full bg-white/70" />
          </div>
          <p className="absolute bottom-10 hidden px-6 text-center text-xs text-white/40 md:block">
            Press the button or click anywhere to continue
          </p>
        </div>
      </div>

      <AnimatePresence>
        {!greeted && (
          <motion.div
            key="hello"
            // Lifts straight up like a curtain, uncovering the login below.
            exit={{ y: "-100%" }}
            transition={{
              duration: reduced ? 0.4 : 1.3,
              ease: [0.7, 0, 0.3, 1],
            }}
            // Skipping is a click anywhere — the same escape macOS gives you.
            onClick={() => setGreeted(true)}
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#190a13]"
          >
            {/* The brand pinks at their deepest — dark enough for the white
                stroke to carry, warm enough to belong to the desktop it hands
                off to. Sand only grazes the floor; any more washes out. */}
            <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_18%_12%,#9f2b68_0%,transparent_60%),radial-gradient(85%_65%_at_86%_18%,#6b1f49_0%,transparent_58%),radial-gradient(110%_80%_at_50%_110%,#de3163_0%,transparent_60%)]" />
            <HelloMark />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
