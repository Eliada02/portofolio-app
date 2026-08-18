"use client";

import { useState } from "react";
import { Briefcase, GraduationCap, BookOpen, MapPin } from "lucide-react";
import {
  experience,
  courses,
  education,
  type Experience,
} from "@/lib/data";
import { SplitView, type SplitViewSection } from "@/components/os/SplitView";

/** Stable ids: the sidebar and the detail pane both key off these. */
const roleId = (prefix: string, index: number) => `${prefix}-${index}`;

const SECTIONS: SplitViewSection[] = [
  {
    title: "Experience",
    items: experience.map((entry, i) => ({
      id: roleId("job", i),
      label: entry.role,
      detail: `${entry.company} · ${entry.period}`,
      icon: <Briefcase className="size-4" />,
    })),
  },
  {
    title: "Courses",
    items: courses.map((entry, i) => ({
      id: roleId("course", i),
      label: entry.role,
      detail: `${entry.company} · ${entry.period}`,
      icon: <BookOpen className="size-4" />,
    })),
  },
  {
    title: "Education",
    items: education.map((entry, i) => ({
      id: roleId("edu", i),
      label: entry.school,
      detail: entry.period,
      icon: <GraduationCap className="size-4" />,
    })),
  },
];

const BY_ID: Record<string, Experience> = {
  ...Object.fromEntries(experience.map((e, i) => [roleId("job", i), e])),
  ...Object.fromEntries(courses.map((e, i) => [roleId("course", i), e])),
  // Education has a different shape; normalise it into the same detail view.
  ...Object.fromEntries(
    education.map((e, i) => [
      roleId("edu", i),
      {
        role: e.degree,
        company: e.school,
        period: e.period,
        location: "",
        points: [],
      } satisfies Experience,
    ])
  ),
};

function Detail({ entry }: { entry: Experience }) {
  return (
    <article className="p-5 @sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {entry.period}
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight @sm:text-2xl">
        {entry.role}
      </h1>
      <p className="mt-0.5 text-base text-muted-foreground">{entry.company}</p>

      {entry.location && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {entry.location}
        </p>
      )}

      {entry.points.length > 0 && (
        <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
          {entry.points.map((point, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60"
              />
              {point}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function ExperienceApp() {
  const [selected, setSelected] = useState(roleId("job", 0));
  const entry = BY_ID[selected];

  return (
    <SplitView
      label="Roles and education"
      sections={SECTIONS}
      selectedId={selected}
      onSelect={setSelected}
    >
      {entry && <Detail entry={entry} />}
    </SplitView>
  );
}
