"use client";

import { useState } from "react";
import { BookUser, Link2, MapPin, UserRound } from "lucide-react";
import { profile, education, skills } from "@/lib/data";
import { SocialIcon } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { socialHref, socialTarget } from "@/lib/contact";
import { SplitView, type SplitViewSection } from "@/components/os/SplitView";

const SECTIONS: SplitViewSection[] = [
  {
    title: "About",
    items: [
      { id: "overview", label: "Overview", icon: <UserRound className="size-4" /> },
      { id: "background", label: "Background", icon: <BookUser className="size-4" /> },
      { id: "links", label: "Links", icon: <Link2 className="size-4" /> },
    ],
  },
];

function Overview() {
  // A short, honest summary of the stack, pulled from the same source the
  // Skills app uses so the two can't drift apart.
  const headline = skills
    .find((g) => g.category === "Frontend")
    ?.items.slice(0, 4)
    .join(" · ");

  return (
    <div>
      <div className="h-24 bg-linear-to-br from-brand-cerise via-brand-magenta to-brand-sand @sm:h-28" />
      <div className="-mt-10 px-5 pb-8 @sm:-mt-12 @sm:px-8">
        <div className="flex flex-wrap items-end gap-3 @sm:gap-4">
          <Avatar className="size-20 rounded-full shadow-xl ring-4 ring-background @sm:size-24" />
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

        <p className="mt-5 text-balance text-base font-medium @sm:text-lg">
          {profile.tagline}
        </p>

        {headline && (
          <p className="mt-2 text-sm text-muted-foreground">{headline}</p>
        )}
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="p-5 @sm:p-8">
      <h1 className="text-lg font-semibold tracking-tight @sm:text-xl">
        Background
      </h1>
      <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
        {profile.bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Education
      </h2>
      <div className="mt-3 space-y-2">
        {education.map((entry) => (
          <div
            key={entry.school}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <p className="font-medium">{entry.degree}</p>
            <p className="text-sm text-muted-foreground">{entry.school}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {entry.period}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Links() {
  return (
    <div className="p-5 @sm:p-8">
      <h1 className="text-lg font-semibold tracking-tight @sm:text-xl">Links</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The quickest ways to find or reach me.
      </p>

      <div className="mt-5 space-y-2">
        {profile.socials.map((social) => (
          <a
            key={social.label}
            href={socialHref(social)}
            target={socialTarget(social.label)}
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:bg-secondary"
          >
            <SocialIcon label={social.label} className="size-5 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{social.label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {social.handle}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

const PANES: Record<string, () => React.ReactElement> = {
  overview: Overview,
  background: Background,
  links: Links,
};

export function AboutApp() {
  const [selected, setSelected] = useState("overview");
  const Pane = PANES[selected];

  return (
    <SplitView
      label="About sections"
      sections={SECTIONS}
      selectedId={selected}
      onSelect={setSelected}
    >
      <Pane />
    </SplitView>
  );
}
