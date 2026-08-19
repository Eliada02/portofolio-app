"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Files, GitBranch, Search, Settings, X } from "lucide-react";
import { SOURCE_FILES, type SourceFile } from "@/lib/sourceFiles";
import { highlight, TOKEN_COLOR } from "@/lib/highlight";
import { profile } from "@/lib/data";

/** VS Code Dark+ surfaces, so the window reads as the real editor. */
const UI = {
  activityBar: "#333333",
  sidebar: "#252526",
  editor: "#1E1E1E",
  tabActive: "#1E1E1E",
  tabInactive: "#2D2D2D",
  statusBar: "#007ACC",
  border: "#191919",
  text: "#CCCCCC",
  dim: "#8A8A8A",
};

const LANGUAGE_LABEL: Record<SourceFile["language"], string> = {
  ts: "TypeScript",
  tsx: "TypeScript React",
  css: "CSS",
};

function CodePane({ code }: { code: string }) {
  const lines = highlight(code);

  return (
    <pre
      className="scroll-overlay h-full overflow-auto px-0 py-2 font-mono text-[12px] leading-[1.55]"
      style={{ background: UI.editor }}
    >
      <code>
        {lines.map((tokens, i) => (
          <div key={i} className="flex min-w-max hover:bg-white/[0.03]">
            <span
              aria-hidden
              className="w-11 shrink-0 select-none pr-3 text-right tabular-nums"
              style={{ color: "#6E7681" }}
            >
              {i + 1}
            </span>
            <span className="whitespace-pre pr-6">
              {tokens.length === 0 ? (
                " "
              ) : (
                tokens.map((token, j) => (
                  <span key={j} style={{ color: TOKEN_COLOR[token.cls] }}>
                    {token.text}
                  </span>
                ))
              )}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
}

/**
 * A VS Code window showing this portfolio's own source.
 *
 * The excerpts are real files from this repository, picked for the decisions
 * they explain rather than to be exhaustive — the point of the app is to show
 * the code behind the desktop you're looking at.
 */
export function CodeApp() {
  const [openPath, setOpenPath] = useState(SOURCE_FILES[0].path);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const file =
    SOURCE_FILES.find((f) => f.path === openPath) ?? SOURCE_FILES[0];

  return (
    <div
      className="flex h-full flex-col text-[13px]"
      style={{ background: UI.editor, color: UI.text }}
    >
      <div className="flex min-h-0 flex-1">
        {/* Activity bar */}
        <div
          className="flex w-11 shrink-0 flex-col items-center gap-1 py-2"
          style={{ background: UI.activityBar }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Hide explorer" : "Show explorer"}
            aria-pressed={sidebarOpen}
            className="relative grid size-9 place-items-center text-white/60 transition hover:text-white"
          >
            {sidebarOpen && (
              <span className="absolute left-0 h-6 w-0.5 bg-white" />
            )}
            <Files className={`size-5 ${sidebarOpen ? "text-white" : ""}`} />
          </button>
          {[Search, GitBranch].map((Icon, i) => (
            <span
              key={i}
              aria-hidden
              className="grid size-9 place-items-center text-white/35"
            >
              <Icon className="size-5" />
            </span>
          ))}
          <span
            aria-hidden
            className="mt-auto grid size-9 place-items-center text-white/35"
          >
            <Settings className="size-5" />
          </span>
        </div>

        {/* Explorer */}
        {sidebarOpen && (
          <div
            className="hidden w-56 shrink-0 flex-col overflow-y-auto @md:flex"
            style={{ background: UI.sidebar }}
          >
            <p
              className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: UI.dim }}
            >
              Explorer
            </p>
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/70">
              cv-portofolio
            </p>
            <ul className="pb-3">
              {SOURCE_FILES.map((f) => {
                const active = f.path === openPath;
                return (
                  <li key={f.path}>
                    <button
                      type="button"
                      onClick={() => setOpenPath(f.path)}
                      aria-current={active ? "true" : undefined}
                      className={`block w-full truncate py-1 pl-6 pr-3 text-left text-[12px] transition ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/65 hover:bg-white/5"
                      }`}
                      title={f.path}
                    >
                      {f.path.split("/").pop()}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Tab bar */}
          <div
            className="flex shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ background: UI.tabInactive }}
          >
            {SOURCE_FILES.map((f) => {
              const active = f.path === openPath;
              return (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => setOpenPath(f.path)}
                  className="relative flex shrink-0 items-center gap-2 border-r px-3 py-2 text-[12px] transition"
                  style={{
                    background: active ? UI.tabActive : "transparent",
                    borderColor: UI.border,
                    color: active ? "#FFFFFF" : UI.dim,
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="code-tab-underline"
                      className="absolute inset-x-0 top-0 h-0.5"
                      style={{ background: UI.statusBar }}
                    />
                  )}
                  {f.path.split("/").pop()}
                  <X className="size-3 opacity-0" aria-hidden />
                </button>
              );
            })}
          </div>

          {/* Breadcrumb + why-this-file note */}
          <div
            className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5 text-[11px]"
            style={{ borderColor: UI.border, color: UI.dim }}
          >
            <span className="truncate">{file.path}</span>
            <span className="hidden truncate italic opacity-70 @sm:inline">
              — {file.note}
            </span>
          </div>

          <div className="min-h-0 flex-1">
            <CodePane code={file.code} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex h-6 shrink-0 items-center gap-4 px-3 text-[11px] text-white"
        style={{ background: UI.statusBar }}
      >
        <span className="flex items-center gap-1.5">
          <GitBranch className="size-3" aria-hidden />
          main
        </span>
        <span className="ml-auto hidden @sm:inline">
          {LANGUAGE_LABEL[file.language]}
        </span>
        <span className="truncate">{profile.name}</span>
      </div>
    </div>
  );
}
