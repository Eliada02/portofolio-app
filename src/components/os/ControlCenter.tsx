"use client";

import { Popover, Slider } from "radix-ui";
import { Bluetooth, Moon, Sun, SunDim, Wifi, WifiOff } from "lucide-react";
import { useOS } from "@/lib/store";
import { useTheme, type Theme } from "@/lib/theme";

const APPEARANCES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
];

/** The rounded pill tiles Control Center uses for on/off hardware. */
function Toggle({
  on,
  onClick,
  icon,
  label,
  detail,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-foreground/6"
    >
      <span
        className={[
          "grid size-8 shrink-0 place-items-center rounded-full transition-colors",
          on
            ? "bg-[#0a84ff] text-white"
            : "bg-foreground/12 text-foreground/70",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold leading-tight">
          {label}
        </span>
        <span className="block truncate text-[11px] leading-tight opacity-60">
          {detail}
        </span>
      </span>
    </button>
  );
}

export function ControlCenter() {
  const { theme, setTheme } = useTheme();
  const wifi = useOS((s) => s.wifi);
  const bluetooth = useOS((s) => s.bluetooth);
  const brightness = useOS((s) => s.brightness);
  const setWifi = useOS((s) => s.setWifi);
  const setBluetooth = useOS((s) => s.setBluetooth);
  const setBrightness = useOS((s) => s.setBrightness);

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Control Center"
        className="rounded p-0.5 outline-none transition hover:bg-white/20 data-[state=open]:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {/* The two stacked toggle rows of the Control Center glyph. */}
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
          <rect x="1.5" y="2" width="13" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="10.5" cy="4.5" r="1.4" fill="currentColor" />
          <rect x="1.5" y="9" width="13" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="5.5" cy="11.5" r="1.4" fill="currentColor" />
        </svg>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className={[
            "material-thick rim z-10000 w-72 rounded-2xl p-3 elevate-panel text-foreground",
            "origin-[var(--radix-popover-content-transform-origin)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          ].join(" ")}
        >
          <div className="rounded-2xl bg-foreground/4 p-1.5">
            <Toggle
              on={wifi}
              onClick={() => setWifi(!wifi)}
              icon={wifi ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
              label="Wi-Fi"
              detail={wifi ? "Home" : "Off"}
            />
            <Toggle
              on={bluetooth}
              onClick={() => setBluetooth(!bluetooth)}
              icon={<Bluetooth className="size-4" />}
              label="Bluetooth"
              detail={bluetooth ? "On" : "Off"}
            />
          </div>

          <div className="mt-3">
            <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide opacity-55">
              Appearance
            </p>
            <div
              role="radiogroup"
              aria-label="Appearance"
              className="flex rounded-xl bg-foreground/7 p-0.5"
            >
              {APPEARANCES.map((option) => {
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTheme(option.value)}
                    className={[
                      "flex-1 rounded-[10px] px-2 py-1.5 text-[12px] font-medium transition",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-foreground/65 hover:text-foreground",
                    ].join(" ")}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {option.value === "light" && <Sun className="size-3.5" />}
                      {option.value === "dark" && <Moon className="size-3.5" />}
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide opacity-55">
              Display
            </p>
            <Slider.Root
              value={[brightness * 100]}
              onValueChange={([v]) => setBrightness(v / 100)}
              min={40}
              max={100}
              step={1}
              aria-label="Display brightness"
              className="relative flex h-8 w-full touch-none select-none items-center"
            >
              <Slider.Track className="relative h-8 w-full overflow-hidden rounded-xl bg-foreground/9">
                <Slider.Range className="absolute inset-y-0 left-0 bg-foreground/25" />
                <SunDim className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-foreground/70" />
              </Slider.Track>
              {/* Invisible but focusable: macOS shows no knob, keyboards need one. */}
              <Slider.Thumb className="block size-8 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </Slider.Root>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
