"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tooltip } from "radix-ui";
import { ArrowUpRight, X } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { BrandIcon, getBrand } from "@/components/BrandIcon";
import { BrowserFrame } from "@/components/BrowserFrame";

/**
 * A tech badge. Where a brand mark exists the badge is the mark alone, with
 * the name on hover — a row of logos reads faster than a row of words, and
 * the card has little room. Anything unbranded ("REST APIs", "SQL") keeps its
 * text, because a blank square communicates nothing.
 */
function TechBadge({ label }: { label: string }) {
  const brand = getBrand(label);

  if (!brand) {
    return (
      <span className="inline-flex h-6 items-center rounded-md bg-secondary px-2 text-[10px] font-medium text-secondary-foreground">
        {label}
      </span>
    );
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          // Focusable so the tooltip is reachable without a pointer.
          tabIndex={0}
          className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary outline-none ring-ring focus-visible:ring-2"
        >
          <BrandIcon label={label} className="size-3.5" />
          <span className="sr-only">{label}</span>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={6}
          className="material-thick rim z-10000 rounded-md px-2 py-1 text-[11px] font-medium text-foreground shadow-lg data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
        >
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** Full pill with the name spelled out — used where there's room. */
function TechPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
      <BrandIcon label={label} className="size-3 shrink-0" />
      {label}
    </span>
  );
}

/**
 * Live-demo / source buttons. The surrounding card is click-to-open, so each
 * link stops the click from also opening the detail sheet.
 */
function ProjectActions({
  project,
  size = "sm",
}: {
  project: Project;
  size?: "sm" | "md";
}) {
  const padding = size === "md" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-xs";
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (!project.link && !project.repo) return null;

  return (
    // z-10 lifts these above the card heading's stretched hit area.
    <div className="relative z-10 flex flex-wrap items-center gap-2">
      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          onClick={stop}
          aria-label={`Open the live demo of ${project.name} in a new tab`}
          className={`inline-flex items-center gap-1.5 rounded-lg bg-primary font-medium text-primary-foreground transition hover:opacity-90 ${padding}`}
        >
          Live Demo <ArrowUpRight className="size-3.5" />
        </a>
      )}
      {project.repo && (
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          onClick={stop}
          aria-label={`View the source of ${project.name} on GitHub in a new tab`}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card font-medium transition hover:bg-secondary ${padding}`}
        >
          <BrandIcon label="GitHub" className="size-3.5" /> Code
        </a>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const featured = project.featured;

  return (
    <motion.div
      layout
      // The feature tile takes the full width; the rest tile beneath it. That
      // contrast is what makes the grid read as bento rather than as a plain
      // two-column list.
      className={featured ? "@lg:col-span-2" : ""}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* The card is clickable for pointers, but it is not itself a control:
          it contains links, and nesting interactive elements inside a button
          is invalid. The heading button carries the keyboard path and the
          accessible name instead. */}
      <div
        onClick={onOpen}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-3 text-left shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
      >
        <BrowserFrame
          url={project.link ?? project.repo}
          accent={project.accent}
          screenshot={project.screenshot}
          alt={project.screenshotAlt}
        >
          <span className="absolute bottom-2 right-3 text-xs font-medium text-white/85">
            {project.year}
          </span>
          {featured && (
            <span className="absolute left-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Featured
            </span>
          )}
        </BrowserFrame>

        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <h3 className="font-semibold tracking-tight">
            <button
              type="button"
              onClick={onOpen}
              // Stretches its hit area over the whole card, so the visible
              // click target and the accessible control are the same thing.
              className="text-left outline-none after:absolute after:inset-0 after:content-['']"
            >
              {project.name}
              <span className="sr-only"> — view details</span>
            </button>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {project.summary}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <TechBadge key={tag} label={tag} />
            ))}
          </div>

          {/* Pushed to the bottom so cards of different heights still line up. */}
          <div className="not-empty:mt-auto not-empty:pt-4">
            <ProjectActions project={project} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** A macOS sheet: slides down out of the title bar rather than fading in. */
function ProjectSheet({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
            className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.name}
            initial={{ y: "-100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-x-3 top-0 z-30 mx-auto max-h-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-b-2xl border border-t-0 border-border bg-card shadow-2xl @sm:inset-x-6"
          >
            <div className="relative p-3 pb-0">
              <BrowserFrame
                url={project.link ?? project.repo}
                accent={project.accent}
                screenshot={project.screenshot}
                alt={project.screenshotAlt}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="absolute right-5 top-12 grid size-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 @sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  {project.name}
                </h2>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {project.year}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <TechPill key={tag} label={tag} />
                ))}
              </div>

              <div className="mt-5">
                <ProjectActions project={project} size="md" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ProjectsApp() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    // One provider for the whole window; every badge shares its timing.
    <Tooltip.Provider delayDuration={250} skipDelayDuration={400}>
      <div className="scroll-overlay h-full overflow-y-auto p-4 @sm:p-6">
        <h1 className="text-lg font-semibold tracking-tight @sm:text-xl">
          Selected Work
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few things I&apos;ve designed and built. Open a card for the detail.
        </p>

        {/* Container queries, not viewport ones: a window can be narrow on a
            wide display, and the grid has to answer to the window. */}
        <div className="mt-5 grid auto-rows-fr grid-cols-1 gap-4 @lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => setActive(project)}
            />
          ))}
        </div>

        <ProjectSheet project={active} onClose={() => setActive(null)} />
      </div>
    </Tooltip.Provider>
  );
}
