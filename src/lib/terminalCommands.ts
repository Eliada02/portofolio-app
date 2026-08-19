import { profile, projects, skills, experience } from "@/lib/data";
import type { AppId } from "@/lib/store";
import { setTheme, type Theme } from "@/lib/theme";

/**
 * The shell behind the Terminal app: what each command prints, and how the
 * buffer is completed.
 *
 * Kept out of the component because none of it is UI — it's a pure registry
 * plus two string functions, which is far easier to read (and to extend with a
 * new command) away from the rendering and the key handling.
 */

export type LineKind = "input" | "output" | "error" | "accent";
export type Line = { kind: LineKind; text: string };

/** Apps the shell will open. The tool windows are reached from the desktop. */
const OPENABLE: AppId[] = [
  "about",
  "projects",
  "experience",
  "skills",
  "contact",
  "terminal",
];

const THEMES: Theme[] = ["light", "dark", "system"];

export type CommandContext = {
  openApp: (id: AppId) => void;
  clear: () => void;
};

export type Command = {
  name: string;
  summary: string;
  /** Completions for the first argument, if the command takes one. */
  completions?: readonly string[];
  /** Returns the lines to print. */
  run: (args: string[], ctx: CommandContext) => Line[];
};

// Narrow the free-text argument once, so nothing downstream has to assert.
const isOpenable = (value: string): value is AppId =>
  (OPENABLE as string[]).includes(value);

const isTheme = (value: string): value is Theme =>
  (THEMES as string[]).includes(value);

const out = (...texts: string[]): Line[] =>
  texts.map((text) => ({ kind: "output", text }));

/**
 * One registry drives the prompt, `help`, tab completion and the inline
 * autosuggestion — so a new command can never fall out of sync with its own
 * documentation.
 */
export const COMMANDS: Command[] = [
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
      {
        kind: "accent",
        text: `${profile.name} — ${profile.role} @ ${profile.company}`,
      },
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
      const target = args[0];
      if (!target) {
        return [
          { kind: "error", text: `open: needs an app — ${OPENABLE.join(", ")}` },
        ];
      }
      if (!isOpenable(target)) {
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
      const next = args[0];
      if (!next || !isTheme(next)) {
        return [
          {
            kind: "error",
            text: `theme: expected one of ${THEMES.join(", ")}`,
          },
        ];
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

export const COMMAND_MAP = new Map(COMMANDS.map((c) => [c.name, c]));
const COMMAND_NAMES = COMMANDS.map((c) => c.name);

/** The longest prefix shared by every candidate — what Tab fills in. */
export function commonPrefix(values: string[]): string {
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
export function completionsFor(buffer: string): {
  token: string;
  matches: string[];
} {
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
