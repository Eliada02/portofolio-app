"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/data";
import { useOS } from "@/lib/store";
import { useIsTouch } from "@/lib/useMediaQuery";
import { useTheme } from "@/lib/theme";
import {
  COMMAND_MAP,
  commonPrefix,
  completionsFor,
  type Line,
} from "@/lib/terminalCommands";

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

/**
 * The tail of the best completion for the current buffer, shown greyed after
 * the caret. A previously run command wins over the registry, the way the real
 * zsh-autosuggestions plugin prefers history.
 */
function suggestFor(value: string, recent: string[]): string {
  if (!value || /\s$/.test(value)) return "";
  const { token, matches } = completionsFor(value);
  if (matches.length === 0) return "";
  const fromHistory = [...recent]
    .reverse()
    .find((h) => h.startsWith(value) && h !== value);
  return fromHistory
    ? fromHistory.slice(value.length)
    : matches[0].slice(token.length);
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
  const suggestion = suggestFor(value, recent);

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
