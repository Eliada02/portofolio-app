/**
 * A deliberately small syntax highlighter.
 *
 * Shiki or Prism would be the right call for a docs site, but this renders
 * four short excerpts inside a fake editor — pulling in a grammar engine and
 * a theme would cost more than the whole rest of the app. This covers the
 * five token classes that carry almost all of the visual signal: comments,
 * strings, keywords, numbers and everything else.
 */

export type TokenClass =
  | "comment"
  | "string"
  | "keyword"
  | "flow"
  | "number"
  | "plain";

export type Token = { text: string; cls: TokenClass };

/** Declarations and types — VS Code's Dark+ paints these blue. */
const KEYWORDS =
  "const|let|var|function|type|interface|extends|implements|class|new|import|from|export|default|as|async|await|this|void|null|undefined|true|false|readonly|public|private|satisfies|typeof|keyof|in|of";

/** Control flow — Dark+ paints these mauve, distinct from declarations. */
const FLOW = "return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw";

/**
 * One pass, in precedence order: comments swallow everything inside them,
 * then strings, then bare words. Scanning the whole text (rather than line by
 * line) is what makes multi-line block comments work without tracking state.
 */
const TOKEN_RE = new RegExp(
  [
    "(/\\*[\\s\\S]*?\\*/|//[^\\n]*)", // 1 comment
    "(`(?:\\\\.|[^`\\\\])*`|\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*')", // 2 string
    `\\b(${KEYWORDS})\\b`, // 3 keyword
    `\\b(${FLOW})\\b`, // 4 flow
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 5 number
  ].join("|"),
  "g"
);

function classify(match: RegExpExecArray): TokenClass {
  if (match[1]) return "comment";
  if (match[2]) return "string";
  if (match[3]) return "keyword";
  if (match[4]) return "flow";
  return "number";
}

/** Splits source into lines of tokens, ready to render with line numbers. */
export function highlight(source: string): Token[][] {
  const flat: Token[] = [];
  let cursor = 0;

  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(source)) !== null) {
    if (match.index > cursor) {
      flat.push({ text: source.slice(cursor, match.index), cls: "plain" });
    }
    flat.push({ text: match[0], cls: classify(match) });
    cursor = match.index + match[0].length;
  }
  if (cursor < source.length) {
    flat.push({ text: source.slice(cursor), cls: "plain" });
  }

  // Re-split across newlines so each line can carry its own number.
  const lines: Token[][] = [[]];
  for (const token of flat) {
    const parts = token.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, cls: token.cls });
    });
  }
  return lines;
}

/** VS Code Dark+, the palette these excerpts are meant to be read in. */
export const TOKEN_COLOR: Record<TokenClass, string> = {
  comment: "#6A9955",
  string: "#CE9178",
  keyword: "#569CD6",
  flow: "#C586C0",
  number: "#B5CEA8",
  plain: "#D4D4D4",
};
