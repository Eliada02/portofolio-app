"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";

export interface MobileSheetProps {
  open: boolean;
  /** Shown in the sheet's nav bar and used as its accessible name. */
  title: string;
  onDismiss: () => void;
  children: React.ReactNode;
}

/** Past either of these, the flick reads as "dismiss" rather than "peek". */
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;

const SHEET_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 36,
  mass: 0.9,
} as const;

/**
 * The iOS 18 modal sheet: a card that rises over the home screen, with a
 * grabber you can drag down to dismiss.
 *
 * Dragging is bound to the header rather than the whole sheet. A sheet whose
 * body is also a drag target fights its own scroll view — you try to scroll
 * up and dismiss the sheet instead. iOS solves this by only handing the
 * gesture to the sheet when the scroller is already at the top; scoping the
 * gesture to the grabber gets the same result far more predictably.
 */
export function MobileSheet({
  open,
  title,
  onDismiss,
  children,
}: MobileSheetProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onDismiss}
            aria-hidden
            className="absolute inset-0 z-10 bg-black/45"
          />

          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SHEET_SPRING}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            // top: 0 pins the sheet at its detent; bottom: 1 lets it track the
            // finger exactly on the way down, with no rubber-band lag.
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (
                info.offset.y > DISMISS_OFFSET ||
                info.velocity.y > DISMISS_VELOCITY
              ) {
                onDismiss();
              }
            }}
            className="absolute inset-x-0 bottom-0 top-3 z-20 flex flex-col overflow-hidden rounded-t-[2.25rem] bg-background shadow-[0_-8px_40px_-8px_rgb(0_0_0/0.45)]"
          >
            {/* Header — the whole strip is the drag surface. */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="shrink-0 touch-none"
            >
              <div className="flex justify-center pb-1 pt-2.5">
                <span
                  aria-hidden
                  className="h-1.5 w-9 rounded-full bg-foreground/25"
                />
              </div>

              <div className="relative flex h-11 items-center justify-center border-b border-border/60 px-4">
                <h2 className="truncate text-[17px] font-semibold tracking-tight">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onDismiss}
                  // 44x44 minimum touch target, per the HIG.
                  className="absolute right-2 grid size-11 place-items-center rounded-full text-[17px] font-medium text-primary transition active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="@container scroll-overlay min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
