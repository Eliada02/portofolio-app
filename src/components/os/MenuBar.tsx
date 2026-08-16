"use client";

import { useOS } from "@/lib/store";
import { APP_MAP } from "@/lib/apps";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { Apple, Battery, Wifi, Search } from "lucide-react";

export function MenuBar() {
  const now = useClock();
  const windows = useOS((s) => s.windows);

  const focused = windows
    .filter((w) => !w.minimized)
    .sort((a, b) => b.z - a.z)[0];
  const activeName = focused ? APP_MAP[focused.id].name : "Finder";

  const date = formatDate(now);
  const time = formatTime(now);

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] flex h-7 items-center justify-between gap-2 bg-black/25 px-2 text-[12px] text-white backdrop-blur-md sm:px-3 sm:text-[13px]">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
        <Apple className="size-4 shrink-0 fill-white" strokeWidth={0} />
        <span className="truncate font-semibold">{activeName}</span>
        <span className="hidden opacity-90 md:inline">File</span>
        <span className="hidden opacity-90 md:inline">Edit</span>
        <span className="hidden opacity-90 md:inline">View</span>
        <span className="hidden opacity-90 lg:inline">Window</span>
        <span className="hidden opacity-90 lg:inline">Help</span>
      </div>
      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
        <Battery className="size-4" />
        <Wifi className="size-4" />
        <Search className="hidden size-4 sm:block" />
        <span className="hidden opacity-90 sm:inline">{date}</span>
        <span className="tabular-nums">{time}</span>
      </div>
    </div>
  );
}
