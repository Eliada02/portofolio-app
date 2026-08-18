"use client";

import { Download, FolderOpen, MessageCircle } from "lucide-react";
import { useOS } from "@/lib/store";
import { profile } from "@/lib/data";

export interface HeroActionsProps {
  /** `lg` for the welcome window, `sm` inside the About header. */
  size?: "sm" | "lg";
  className?: string;
}

/**
 * The three things a first-time visitor most likely wants: the work, the CV,
 * and a way to make contact.
 *
 * The CV button renders only when `profile.resume` points at a real file.
 * A "Download CV" that 404s costs more trust than a missing button does.
 */
export function HeroActions({ size = "sm", className = "" }: HeroActionsProps) {
  const openApp = useOS((s) => s.openApp);

  const pad =
    size === "lg" ? "px-4 py-2.5 text-sm" : "px-3 py-2 text-[13px]";
  const base =
    "inline-flex items-center gap-2 rounded-xl font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => openApp("projects")}
        className={`${base} ${pad} bg-primary text-primary-foreground shadow-sm hover:opacity-90`}
      >
        <FolderOpen className="size-4 shrink-0" />
        View Featured Projects
      </button>

      {profile.resume && (
        <a
          href={profile.resume}
          download
          className={`${base} ${pad} border border-border bg-card hover:bg-secondary`}
        >
          <Download className="size-4 shrink-0" />
          Download CV
        </a>
      )}

      <button
        type="button"
        onClick={() => openApp("contact")}
        className={`${base} ${pad} border border-border bg-card hover:bg-secondary`}
      >
        <MessageCircle className="size-4 shrink-0" />
        Get in Touch
      </button>
    </div>
  );
}
