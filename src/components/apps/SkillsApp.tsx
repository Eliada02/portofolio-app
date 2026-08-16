"use client";

import { skills } from "@/lib/data";
import { BrandIcon } from "@/components/BrandIcon";

export function SkillsApp() {
  return (
    <div className="h-full overflow-y-auto p-4 @sm:p-6">
      <h1 className="text-lg font-semibold tracking-tight @sm:text-xl">
        Skills &amp; Tools
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The stack I reach for, grouped by where it lives.
      </p>

      <div className="mt-6 space-y-5">
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm"
                >
                  {/* Renders nothing for unbranded entries like SQL. */}
                  <BrandIcon label={item} className="size-4 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
