"use client";

import { useState } from "react";
import { projects, type Project } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";

export function ProjectsApp() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4 @sm:p-6">
      <h1 className="text-lg font-semibold tracking-tight @sm:text-xl">
        Selected Work
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A few things I&apos;ve designed and built. Tap a card for details.
      </p>

      <div className="mt-5 grid gap-4 @lg:grid-cols-2">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="group text-left"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div
                className={`h-24 bg-gradient-to-br ${p.accent} relative`}
              >
                <span className="absolute bottom-2 right-3 text-xs font-medium text-white/80">
                  {p.year}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {p.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm @sm:p-6"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-20 shrink-0 bg-gradient-to-br @sm:h-28 ${active.accent}`} />
            <div className="p-4 @sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{active.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {active.year}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {active.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {active.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {active.link && (
                  <a
                    href={active.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Visit <ArrowUpRight className="size-4" />
                  </a>
                )}
                {active.repo && (
                  <a
                    href={active.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-secondary"
                  >
                    <BrandIcon label="GitHub" className="size-4" /> Code
                  </a>
                )}
                <button
                  onClick={() => setActive(null)}
                  className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
