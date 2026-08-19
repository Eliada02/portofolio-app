"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useOS } from "@/lib/store";
import { profile } from "@/lib/data";
import { HelloMark, HELLO_DURATION } from "./HelloMark";
import { AmbientBackdrop } from "./boot/AmbientBackdrop";
import { AvatarOrbit } from "./boot/AvatarOrbit";
import { BootLog } from "./boot/BootLog";
import { LockMenuBar } from "./boot/LockMenuBar";
import { TouchIdButton, type UnlockPhase } from "./boot/TouchIdButton";

/** Beat between the last stroke landing and the screen lifting away. */
const HOLD = 0.5;
/** Time the unlocked state is held before the desktop takes over. */
const HANDOFF_MS = 380;

export function BootScreen() {
  const setBooted = useOS((s) => s.setBooted);
  const openApp = useOS((s) => s.openApp);
  const reduced = useReducedMotion();
  const [greeted, setGreeted] = useState(false);
  const [phase, setPhase] = useState<UnlockPhase>("idle");

  useEffect(() => {
    const ms = reduced ? 900 : (HELLO_DURATION + HOLD) * 1000;
    const t = setTimeout(() => setGreeted(true), ms);
    return () => clearTimeout(t);
  }, [reduced]);

  const scan = () => setPhase("scanning");

  /** Called when the sensor finishes reading. Stable, so the sensor's own
   *  scan timer isn't restarted by a re-render mid-read. */
  const unlock = useCallback(() => {
    setPhase("unlocked");
    setTimeout(() => {
      setBooted(true);
      setTimeout(() => openApp("welcome"), 400);
    }, HANDOFF_MS);
  }, [setBooted, openApp]);

  // Enter / Space unlock too — a login screen that only takes a click is not
  // reachable from a keyboard.
  useEffect(() => {
    if (!greeted || phase !== "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPhase("scanning");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [greeted, phase]);

  return (
    <div className="fixed inset-0 z-10000 overflow-hidden">
      {/* The lock screen sits underneath from the start, so lifting the hello
          curtain reveals it already settled — as macOS does after setup. */}
      <div className="absolute inset-0">
        <AmbientBackdrop />
        <LockMenuBar />

        {/* Click anywhere to begin the scan, behind the content so the sensor
            still gets its own hover and clicks. */}
        <button
          type="button"
          onClick={() => phase === "idle" && scan()}
          className="absolute inset-0 z-0 cursor-default"
          aria-label="Unlock"
          tabIndex={-1}
        />

        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6">
          <AvatarOrbit />

          <div className="relative -mt-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 max-w-md text-balance text-sm text-white/70">
              {profile.headline}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
              Interactive macOS Portfolio — unlock to explore
            </span>
          </div>

          <div className="relative mt-2">
            <TouchIdButton phase={phase} onScan={scan} onComplete={unlock} />
          </div>
        </div>

        <BootLog />
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
