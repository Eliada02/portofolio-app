"use client";

import { useOS, type WindowState } from "@/lib/store";
import { APP_MAP } from "@/lib/apps";
import { useWindowGeometry } from "@/lib/useWindowGeometry";
import { useIsTouch } from "@/lib/useMediaQuery";
import { WindowFrame } from "./WindowFrame";

export interface WindowProps {
  win: WindowState;
  /** True when this window is frontmost — drives the chrome's focus state. */
  focused: boolean;
}

/**
 * Binds one entry of the window store to the presentational `WindowFrame`.
 * Desktop only; phones present apps through `MobileShell`.
 */
export function Window({ win, focused }: WindowProps) {
  const focusApp = useOS((s) => s.focusApp);
  const closeApp = useOS((s) => s.closeApp);
  const minimizeApp = useOS((s) => s.minimizeApp);
  const toggleMaximize = useOS((s) => s.toggleMaximize);
  const moveWindow = useOS((s) => s.moveWindow);
  const resizeWindow = useOS((s) => s.resizeWindow);

  const isTouch = useIsTouch();
  const geometry = useWindowGeometry(win);
  const meta = APP_MAP[win.id];
  const Content = meta.Component;

  return (
    <WindowFrame
      title={meta.name}
      focused={focused}
      maximized={win.maximized}
      minimized={win.minimized}
      zIndex={win.z}
      geometry={geometry}
      // Touch pointers belong to the scroller, not to window management.
      draggable={!isTouch}
      resizable={!isTouch}
      onFocus={() => focusApp(win.id)}
      onClose={() => closeApp(win.id)}
      onMinimize={() => minimizeApp(win.id)}
      onToggleMaximize={() =>
        toggleMaximize(win.id, { w: window.innerWidth, h: window.innerHeight })
      }
      onDragCommit={(x, y) => moveWindow(win.id, x, y)}
      onResizeCommit={(rect) => resizeWindow(win.id, rect)}
    >
      <Content />
    </WindowFrame>
  );
}
