"use client";

import { experience, courses, education, type Experience } from "@/lib/data";
import { Briefcase, GraduationCap, BookOpen } from "lucide-react";

function Timeline({ entries }: { entries: Experience[] }) {
  return (
    <div className="mt-6 space-y-6 border-l border-border pl-5 @sm:pl-6">
      {entries.map((e, i) => (
        <div key={i} className="relative">
          <span className="absolute -left-[23px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background @sm:-left-[27px]" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-semibold">
              {e.role}{" "}
              <span className="font-normal text-muted-foreground">
                · {e.company}
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">{e.period}</span>
          </div>
          <p className="text-xs text-muted-foreground">{e.location}</p>
          <ul className="mt-2 space-y-1.5">
            {e.points.map((p, j) => (
              <li
                key={j}
                className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-40" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ExperienceApp() {
  return (
    <div className="h-full overflow-y-auto p-4 @sm:p-6">
      <div className="flex items-center gap-2">
        <Briefcase className="size-5 shrink-0 text-muted-foreground" />
        <h1 className="text-lg font-semibold tracking-tight @sm:text-xl">
          Experience
        </h1>
      </div>

      <Timeline entries={experience} />

      <div className="mt-8 flex items-center gap-2">
        <BookOpen className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">Courses</h2>
      </div>

      <Timeline entries={courses} />

      <div className="mt-8 flex items-center gap-2">
        <GraduationCap className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">Education</h2>
      </div>
      <div className="mt-3 space-y-2">
        {education.map((ed, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium">{ed.degree}</p>
              <p className="text-sm text-muted-foreground">{ed.school}</p>
            </div>
            <span className="text-xs text-muted-foreground">{ed.period}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
