"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { profile, projects, skills, experience } from "@/lib/data";
import { useOS, type AppId } from "@/lib/store";
import { useIsTouch } from "@/lib/useMediaQuery";
import { setTheme, useTheme, type Theme } from "@/lib/theme";

type LineKind = "input" | "output" | "error" | "accent";
type Line = { kind: LineKind; text: string };

const OPENABLE: AppId[] = [
  "about",
  "projects",
  "experience",
  "skills",
  "contact",
  "terminal",
];

const THEMES: Theme[] = ["light", "dark", "system"];

type CommandContext = {
  openApp: (id: AppId) => void;
  clear: () => void;
};

type Command = {
  name: string;
  summary: string;
  /** Completions for the first argument, if the command takes one. */
  completions?: readonly string[];
  /** Returns the lines to print. */
  run: (args: string[], ctx: CommandContext) => Line[];
};

const out = (...texts: string[]): Line[] =>
  texts.map((text) => ({ kind: "output", text }));

/**
 * One registry drives the prompt, `help`, tab completion and the inline
 * autosuggestion — so a new command can never fall out of sync with its own
 * documentation.
 */
const COMMANDS: Command[] = [
  {
    name: "help",
    summary: "list every command",
    run: () => [
      { kind: "accent", text: "Available commands" },
      ...COMMANDS.map((c) => ({
        kind: "output" as const,
        text: `  ${c.name.padEnd(11)}${c.summary}`,
      })),
      { kind: "output", text: "" },
      {
        kind: "output",
        text: "  Tab completes · ↑ ↓ history · → accepts the suggestion",
      },
    ],
  },
  {
    name: "about",
    summary: "who I am",
    run: () => [
      { kind: "accent", text: `${profile.name} — ${profile.role} @ ${profile.company}` },
      ...out(profile.location, "", ...profile.bio),
    ],
  },
  {
    name: "skills",
    summary: "the stack I reach for",
    run: () =>
      skills.flatMap((group) => [
        { kind: "accent" as const, text: group.category },
        { kind: "output" as const, text: `  ${group.items.join(", ")}` },
      ]),
  },
  {
    name: "projects",
    summary: "selected work",
    run: () =>
      projects.flatMap((p) => [
        { kind: "accent" as const, text: `${p.name}  (${p.year})` },
        { kind: "output" as const, text: `  ${p.summary}` },
        { kind: "output" as const, text: `  ${p.tags.join(" · ")}` },
        ...(p.link ? [{ kind: "output" as const, text: `  ${p.link}` }] : []),
      ]),
  },
  {
    name: "experience",
    summary: "where I have worked",
    run: () =>
      experience.map((e) => ({
        kind: "output" as const,
        text: `  ${e.period.padEnd(22)}${e.role} — ${e.company}`,
      })),
  },
  {
    name: "contact",
    summary: "how to reach me",
    run: () => [
      ...out(`email  ${profile.email}`, `phone  ${profile.phone}`),
      ...profile.socials.map((s) => ({
        kind: "output" as const,
        text: `${s.label.toLowerCase().padEnd(7)}${s.url}`,
      })),
    ],
  },
  {
    name: "open",
    summary: "open an app — open projects",
    completions: OPENABLE,
    run: (args, ctx) => {
      const target = args[0] as AppId | undefined;
      if (!target) {
        return [{ kind: "error", text: `open: needs an app — ${OPENABLE.join(", ")}` }];
      }
      if (!OPENABLE.includes(target)) {
        return [
          { kind: "error", text: `open: no such app '${target}'` },
          { kind: "output", text: `       try: ${OPENABLE.join(", ")}` },
        ];
      }
      ctx.openApp(target);
      return out(`Opening ${target}…`);
    },
  },
  {
    name: "theme",
    summary: "switch appearance — theme dark",
    completions: THEMES,
    run: (args) => {
      const next = args[0] as Theme | undefined;
      if (!next || !THEMES.includes(next)) {
        return [{ kind: "error", text: `theme: expected one of ${THEMES.join(", ")}` }];
      }
      setTheme(next);
      return out(`Appearance set to ${next}.`);
    },
  },
  {
    name: "ls",
    summary: "list the apps on this desktop",
    run: () => out(OPENABLE.join("  ")),
  },
  {
    name: "whoami",
    summary: "current user",
    run: () => out("guest"),
  },
  {
    name: "clear",
    summary: "clear the screen",
    run: (_args, ctx) => {
      ctx.clear();
      return [];
    },
  },
];

const COMMAND_MAP = new Map(COMMANDS.map((c) => [c.name, c]));
const COMMAND_NAMES = COMMANDS.map((c) => c.name);

/** The longest prefix shared by every candidate — what Tab fills in. */
function commonPrefix(values: string[]): string {
  if (values.length === 0) return "";
  return values.reduce((prefix, value) => {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) i++;
    return prefix.slice(0, i);
  });
}

/**
 * Candidate completions for the current buffer, plus the token being
 * completed. Completing an argument only makes sense once its command is
 * known, so the two cases are resolved separately.
 */
function completionsFor(buffer: string): { token: string; matches: string[] } {
  // A trailing space means the user has finished a token and wants the next.
  const completingNewToken = /\s$/.test(buffer);
  const tokens = buffer.trimStart().split(/\s+/).filter(Boolean);

  if (tokens.length === 0 || (tokens.length === 1 && !completingNewToken)) {
    const token = tokens[0] ?? "";
    return { token, matches: COMMAND_NAMES.filter((n) => n.startsWith(token)) };
  }

  const command = COMMAND_MAP.get(tokens[0]);
  if (!command?.completions) return { token: "", matches: [] };

  const token = completingNewToken ? "" : (tokens[1] ?? "");
  // Only the first argument is completable, and only before a second one.
  if (tokens.length > 2 || (tokens.length === 2 && completingNewToken)) {
    return { token: "", matches: [] };
  }
  return {
    token,
    matches: command.completions.filter((c) => c.startsWith(token)),
  };
}

/** The zsh prompt, drawn the way a default macOS shell renders it. */
function Prompt() {
  return (
    <>
      <span className="text-[#f2758f]">guest@portfolio</span>
      <span className="text-brand-sand/45"> ~ </span>
      <span className="text-[#7fd6a2]">%&nbsp;</span>
    </>
  );
}

export function TerminalApp() {
  const openApp = useOS((s) => s.openApp);
  const isTouch = useIsTouch();
  const { resolved } = useTheme();

  const [history, setHistory] = useState<Line[]>([
    { kind: "accent", text: `${profile.name} — portfolio shell (zsh)` },
    { kind: "output", text: "Type 'help', or press Tab to complete." },
    { kind: "output", text: "" },
  ]);
  const [value, setValue] = useState("");
  /** Submitted commands, newest last. Browsed with the arrow keys. */
  const [recent, setRecent] = useState<string[]>([]);
  /** Index into `recent` while browsing; null means "editing a fresh line". */
  const [recentIndex, setRecentIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  /** zsh-autosuggestions: the tail of the single best match, shown inline. */
  const suggestion = useMemo(() => {
    if (!value || /\s$/.test(value)) return "";
    const { token, matches } = completionsFor(value);
    if (matches.length === 0) return "";
    // Prefer a previously run command, the way the real plugin does.
    const fromHistory = [...recent]
      .reverse()
      .find((h) => h.startsWith(value) && h !== value);
    if (fromHistory) return fromHistory.slice(value.length);
    return matches[0].slice(token.length);
  }, [value, recent]);

  const print = (lines: Line[]) => setHistory((h) => [...h, ...lines]);

  const run = (raw: string) => {
    const input = raw.trim();
    print([{ kind: "input", text: input }]);
    if (input) setRecent((r) => [...r, input]);
    setRecentIndex(null);

    if (!input) return;

    const [name, ...args] = input.split(/\s+/);
    const command = COMMAND_MAP.get(name.toLowerCase());

    if (!command) {
      print([
        { kind: "error", text: `zsh: command not found: ${name}` },
        { kind: "output", text: "Type 'help' for the list." },
      ]);
      return;
    }

    print(command.run(args, { openApp, clear: () => setHistory([]) }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Accept the inline suggestion, but only from the end of the line —
    // mid-line, the right arrow must still move the caret.
    if (
      suggestion &&
      (e.key === "ArrowRight" || e.key === "End") &&
      e.currentTarget.selectionStart === value.length
    ) {
      e.preventDefault();
      setValue(value + suggestion);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const { token, matches } = completionsFor(value);
      if (matches.length === 0) return;

      const filled = commonPrefix(matches);
      if (filled.length > token.length) {
        setValue(value + filled.slice(token.length));
      } else if (matches.length > 1) {
        // Ambiguous and already at the common prefix — list the options.
        print([
          { kind: "input", text: value },
          { kind: "output", text: `  ${matches.join("  ")}` },
        ]);
      } else {
        // Exactly one match, already complete: advance to the argument.
        setValue(`${value} `);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (recent.length === 0) return;
      const next = recentIndex === null ? recent.length - 1 : Math.max(0, recentIndex - 1);
      setRecentIndex(next);
      setValue(recent[next]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (recentIndex === null) return;
      const next = recentIndex + 1;
      if (next >= recent.length) {
        setRecentIndex(null);
        setValue("");
      } else {
        setRecentIndex(next);
        setValue(recent[next]);
      }
      return;
    }

    // Ctrl-L / Cmd-K — both clear the screen in a macOS terminal.
    if ((e.ctrlKey && e.key.toLowerCase() === "l") || (e.metaKey && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      setHistory([]);
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      print([{ kind: "input", text: `${value}^C` }]);
      setValue("");
      setRecentIndex(null);
    }
  };

  return (
    <div
      // 16px on touch: anything smaller makes iOS Safari zoom in on focus.
      className="h-full cursor-text bg-[#1e0c17] p-3 font-mono text-base leading-relaxed text-brand-sand sm:text-[13px]"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="scroll-overlay h-full overflow-y-auto">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line.kind === "input" ? (
              <span>
                <Prompt />
                {line.text}
              </span>
            ) : (
              <span
                className={
                  line.kind === "error"
                    ? "text-[#ff8f7a]"
                    : line.kind === "accent"
                      ? "font-semibold text-[#f2758f]"
                      : "text-brand-sand/80"
                }
              >
                {line.text || " "}
              </span>
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
          <Prompt />
          {/* The suggestion is painted over the input: an invisible copy of
              the typed text lines the tail up with the caret exactly. */}
          <span className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              // Don't yank up the on-screen keyboard the moment the app opens.
              autoFocus={!isTouch}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              aria-label="Terminal input"
              aria-describedby="terminal-hint"
              className="w-full bg-transparent outline-none"
            />
            {suggestion && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 whitespace-pre"
              >
                <span className="invisible">{value}</span>
                <span className="text-brand-sand/30">{suggestion}</span>
              </span>
            )}
          </span>
        </form>

        <p id="terminal-hint" className="sr-only">
          Press Tab to complete a command, the up and down arrows to browse
          history, and the right arrow to accept the inline suggestion. The
          appearance is currently {resolved}.
        </p>
      </div>
    </div>
  );
}
