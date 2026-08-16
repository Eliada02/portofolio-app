"use client";

import { create } from "zustand";

export type AppId =
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "contact"
  | "terminal";

export type WindowState = {
  id: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  // saved geometry before maximize so we can restore
  prev?: { x: number; y: number; width: number; height: number };
};

type Store = {
  booted: boolean;
  setBooted: (v: boolean) => void;

  windows: WindowState[];
  topZ: number;

  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  /** Send every app to the background — the iOS "go home" gesture. */
  minimizeAll: () => void;
  toggleMaximize: (id: AppId, bounds: { w: number; h: number }) => void;
  moveWindow: (id: AppId, x: number, y: number) => void;
  resizeWindow: (id: AppId, width: number, height: number) => void;
  /** Re-fit every window after a viewport resize / orientation change. */
  syncViewport: (vw: number, vh: number) => void;
};

const DEFAULT_SIZE: Record<AppId, { width: number; height: number }> = {
  about: { width: 720, height: 520 },
  projects: { width: 860, height: 600 },
  experience: { width: 720, height: 560 },
  skills: { width: 640, height: 520 },
  contact: { width: 560, height: 480 },
  terminal: { width: 680, height: 440 },
};

/** Space reserved for the menu bar (top) and the dock (bottom). */
const CHROME = { top: 36, bottom: 96, gutter: 8 };
const MIN_SIZE = { width: 280, height: 240 };

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max));

/** Shrink + reposition a window so it always sits fully inside the viewport. */
function fitToViewport(
  win: { x: number; y: number; width: number; height: number },
  vw: number,
  vh: number
) {
  const width = clamp(
    win.width,
    MIN_SIZE.width,
    Math.max(MIN_SIZE.width, vw - CHROME.gutter * 2)
  );
  const height = clamp(
    win.height,
    MIN_SIZE.height,
    Math.max(MIN_SIZE.height, vh - CHROME.top - CHROME.bottom)
  );
  return {
    width: Math.round(width),
    height: Math.round(height),
    x: Math.round(clamp(win.x, CHROME.gutter, vw - width - CHROME.gutter)),
    y: Math.round(clamp(win.y, CHROME.top, vh - height - CHROME.bottom)),
  };
}

const viewport = () => ({
  vw: typeof window !== "undefined" ? window.innerWidth : 1280,
  vh: typeof window !== "undefined" ? window.innerHeight : 800,
});

let spawnOffset = 0;

export const useOS = create<Store>((set, get) => ({
  booted: false,
  setBooted: (v) => set({ booted: v }),

  windows: [],
  topZ: 10,

  openApp: (id) => {
    const { windows, topZ } = get();
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      set({
        windows: windows.map((w) =>
          w.id === id ? { ...w, minimized: false, z: topZ + 1 } : w
        ),
        topZ: topZ + 1,
      });
      return;
    }

    const size = DEFAULT_SIZE[id];
    const { vw, vh } = viewport();
    spawnOffset = (spawnOffset + 1) % 6;
    // Cascade the spawn point, but only on screens with room to cascade.
    const cascade = vw >= 1024 ? spawnOffset : 0;

    const win: WindowState = {
      id,
      ...fitToViewport(
        {
          x: (vw - size.width) / 2 + cascade * 28 - 60,
          y: (vh - size.height) / 2 + cascade * 24 - 40,
          width: size.width,
          height: size.height,
        },
        vw,
        vh
      ),
      z: topZ + 1,
      minimized: false,
      maximized: false,
    };
    set({ windows: [...windows, win], topZ: topZ + 1 });
  },

  closeApp: (id) =>
    set({ windows: get().windows.filter((w) => w.id !== id) }),

  focusApp: (id) => {
    const { windows, topZ } = get();
    if (!windows.find((w) => w.id === id)) return;
    set({
      windows: windows.map((w) =>
        w.id === id ? { ...w, z: topZ + 1, minimized: false } : w
      ),
      topZ: topZ + 1,
    });
  },

  minimizeApp: (id) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
    }),

  minimizeAll: () =>
    set({
      windows: get().windows.map((w) => ({ ...w, minimized: true })),
    }),

  toggleMaximize: (id, bounds) => {
    const { windows, topZ } = get();
    set({
      windows: windows.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized && w.prev) {
          return { ...w, ...w.prev, maximized: false, prev: undefined, z: topZ + 1 };
        }
        return {
          ...w,
          maximized: true,
          prev: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: CHROME.gutter,
          y: CHROME.top,
          width: bounds.w - CHROME.gutter * 2,
          height: bounds.h - CHROME.top - CHROME.bottom,
          z: topZ + 1,
        };
      }),
      topZ: topZ + 1,
    });
  },

  moveWindow: (id, x, y) => {
    const { vw, vh } = viewport();
    set({
      windows: get().windows.map((w) =>
        w.id === id
          ? {
              ...w,
              // Keep the title bar reachable: never let a window leave the screen.
              x: Math.round(clamp(x, CHROME.gutter - w.width + 80, vw - 80)),
              y: Math.round(clamp(y, CHROME.top, vh - 60)),
            }
          : w
      ),
    });
  },

  resizeWindow: (id, width, height) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    }),

  syncViewport: (vw, vh) =>
    set({
      windows: get().windows.map((w) =>
        w.maximized
          ? {
              ...w,
              x: CHROME.gutter,
              y: CHROME.top,
              width: vw - CHROME.gutter * 2,
              height: vh - CHROME.top - CHROME.bottom,
            }
          : { ...w, ...fitToViewport(w, vw, vh) }
      ),
    }),
}));
