"use client";

import { profile } from "@/lib/data";
import { MapPin } from "lucide-react";
import { SocialIcon } from "@/components/BrandIcon";

export function AboutApp() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="relative">
        <div className="h-24 bg-gradient-to-br from-brand-cerise via-brand-magenta to-brand-sand @sm:h-28" />
        <div className="-mt-10 px-5 pb-8 @sm:-mt-12 @sm:px-8">
          <div className="flex flex-wrap items-end gap-3 @sm:gap-4">
            <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-brand-cerise to-brand-magenta text-2xl font-semibold text-white shadow-xl ring-4 ring-white/80 @sm:size-24 @sm:text-3xl dark:ring-black/40">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-semibold tracking-tight @sm:text-2xl">
                {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground @sm:text-base">
                {profile.role} · {profile.company}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" /> {profile.location}
          </div>

          <p className="mt-5 text-base font-medium text-balance @sm:text-lg">
            {profile.tagline}
          </p>

          <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
            {profile.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-sm font-medium transition hover:bg-secondary"
              >
                <SocialIcon label={s.label} className="size-4 shrink-0" />
                <span className="truncate">{s.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
