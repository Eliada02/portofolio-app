"use client";

import { useEffect, useRef, useState } from "react";
import { profile, projects, skills } from "@/lib/data";
import { useOS, type AppId } from "@/lib/store";
import { useIsTouch } from "@/lib/useMediaQuery";

type Line = { type: "in" | "out"; text: string };

const HELP = `Available commands:
  help        show this help
  about       who am I
  projects    list my work
  skills      my toolkit
  open <app>  open an app (about, projects, experience, skills, contact)
  contact     how to reach me
  whoami      current user
  clear       clear the screen`;

export function TerminalApp() {
  const openApp = useOS((s) => s.openApp);
  const isTouch = useIsTouch();
  const [history, setHistory] = useState<Line[]>([
    { type: "out", text: `${profile.name} — portfolio shell v1.0` },
    { type: "out", text: `Type 'help' to get started.` },
  ]);
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    const out: string[] = [];
    const [name, ...args] = cmd.split(/\s+/);

    switch (name.toLowerCase()) {
      case "":
        break;
      case "help":
        out.push(HELP);
        break;
      case "about":
        out.push(`${profile.name} — ${profile.role} @ ${profile.company}`);
        out.push(profile.tagline);
        break;
      case "projects":
        projects.forEach((p) => out.push(`  ${p.year}  ${p.name} — ${p.summary}`));
        break;
      case "skills":
        skills.forEach((g) => out.push(`  ${g.category}: ${g.items.join(", ")}`));
        break;
      case "contact":
        out.push(`email: ${profile.email}`);
        out.push(`phone: ${profile.phone}`);
        profile.socials.forEach((s) => out.push(`${s.label}: ${s.url}`));
        break;
      case "whoami":
        out.push("guest");
        break;
      case "open": {
        const valid: AppId[] = [
          "about",
          "projects",
          "experience",
          "skills",
          "contact",
        ];
        const target = args[0] as AppId;
        if (valid.includes(target)) {
          openApp(target);
          out.push(`Opening ${target}…`);
        } else {
          out.push(`open: unknown app '${args[0] ?? ""}'. Try: ${valid.join(", ")}`);
        }
        break;
      }
      case "clear":
        setHistory([]);
        return;
      default:
        out.push(`command not found: ${name} — type 'help'`);
    }

    setHistory((h) => [
      ...h,
      { type: "in", text: cmd },
      ...out.map((t) => ({ type: "out" as const, text: t })),
    ]);
  };

  return (
    <div
      // 16px on touch: anything smaller makes iOS Safari zoom in on focus.
      className="h-full cursor-text bg-[#1e0c17] p-3 font-mono text-base leading-relaxed text-brand-sand sm:text-[13px]"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="h-full overflow-y-auto">
        {history.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {l.type === "in" ? (
              <span>
                {/* Lightened cerise, not the raw #DE3163 — that lands at
                    4.2:1 on this background, and mono text runs small. */}
                <span className="text-[#f2758f]">guest@portfolio</span>
                <span className="text-brand-sand/60">:~$ </span>
                {l.text}
              </span>
            ) : (
              <span className="text-brand-sand/80">{l.text}</span>
            )}
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
          className="flex"
        >
          <span className="text-[#f2758f]">guest@portfolio</span>
          <span className="text-brand-sand/60">:~$&nbsp;</span>
          <input
            ref={inputRef}
            // Don't yank up the on-screen keyboard the moment the app opens.
            autoFocus={!isTouch}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </form>
      </div>
    </div>
  );
}
