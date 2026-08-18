"use client";

import { useId, useRef } from "react";

export interface SplitViewItem {
  id: string;
  label: string;
  /** Secondary line under the label — dates, companies, and so on. */
  detail?: string;
  icon?: React.ReactNode;
}

export interface SplitViewSection {
  /** Sidebar group heading. Omit for an ungrouped list. */
  title?: string;
  items: SplitViewItem[];
}

export interface SplitViewProps {
  sections: SplitViewSection[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Accessible name for the source list. */
  label: string;
  children: React.ReactNode;
}

/**
 * The macOS Finder source-list layout: a sidebar of items on the left, the
 * selected item's detail on the right.
 *
 * Below the `@md` container width the sidebar becomes a horizontal strip of
 * pills. That switch is driven by the *container*, not the viewport — a
 * window can be narrow on a wide display, and it's the window that has to
 * decide.
 *
 * Exposed as a tab set: one list controlling one panel is exactly what tab
 * semantics describe, and it brings arrow-key navigation with it.
 */
export function SplitView({
  sections,
  selectedId,
  onSelect,
  label,
  children,
}: SplitViewProps) {
  const listRef = useRef<HTMLDivElement>(null);
  // Namespaced so two split views on screen at once can't collide on ids.
  const uid = useId();
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = `${uid}-panel`;
  const flatIds = sections.flatMap((s) => s.items.map((i) => i.id));

  const onKeyDown = (e: React.KeyboardEvent) => {
    const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    if (!forward && !back) return;

    e.preventDefault();
    const index = flatIds.indexOf(selectedId);
    const next = forward
      ? (index + 1) % flatIds.length
      : (index - 1 + flatIds.length) % flatIds.length;
    onSelect(flatIds[next]);
    // Keep the roving focus with the selection, as a real source list does.
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-item-id="${flatIds[next]}"]`)
      ?.focus();
  };

  return (
    <div className="flex h-full flex-col @md:flex-row">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className={[
          "shrink-0 border-border bg-foreground/3",
          // Narrow: a scrolling strip along the top.
          "flex gap-1.5 overflow-x-auto border-b p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Wide: a proper sidebar.
          "@md:w-52 @md:flex-col @md:gap-0.5 @md:overflow-y-auto @md:overflow-x-visible @md:border-b-0 @md:border-r @md:p-2.5",
        ].join(" ")}
      >
        {sections.map((section, sectionIndex) => (
          <div
            key={section.title ?? sectionIndex}
            className="contents @md:block @md:not-first:mt-4"
          >
            {section.title && (
              <h2 className="hidden px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground @md:block">
                {section.title}
              </h2>
            )}

            {section.items.map((item) => {
              const selected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={tabId(item.id)}
                  aria-controls={panelId}
                  data-item-id={item.id}
                  aria-selected={selected}
                  // Only the selected tab is in the tab order; arrows do the rest.
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onSelect(item.id)}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-lg text-left outline-none transition",
                    "px-3 py-1.5 text-[13px] @md:w-full @md:px-2.5 @md:py-1.5",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-foreground/6",
                  ].join(" ")}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {item.label}
                    </span>
                    {item.detail && (
                      <span
                        className={`hidden truncate text-[11px] @md:block ${
                          selected ? "opacity-80" : "text-muted-foreground"
                        }`}
                      >
                        {item.detail}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        // Named by whichever tab is selected, so moving into the panel
        // announces what it is showing.
        aria-labelledby={tabId(selectedId)}
        // The panel scrolls, so it must be focusable for keyboard scrolling.
        tabIndex={0}
        className="scroll-overlay @container min-h-0 min-w-0 flex-1 overflow-y-auto outline-none"
      >
        {children}
      </div>
    </div>
  );
}
