"use client";

import { Menubar } from "radix-ui";
import { Check } from "lucide-react";

/**
 * Styling for the menu-bar dropdowns, kept in one place so every menu in the
 * bar is visually identical. Behaviour (keyboard nav, typeahead, hover
 * switching between open menus, focus trapping) comes from Radix.
 */

const CONTENT_CLASS = [
  "material-thick rim z-10000 min-w-56 overflow-hidden rounded-[10px] p-1",
  "elevate-panel text-[13px] text-foreground",
  "origin-[var(--radix-menubar-content-transform-origin)]",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
].join(" ");

const ITEM_CLASS = [
  "relative flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-1.5 outline-none",
  "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
].join(" ");

export function MenuTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Menubar.Trigger
      className={[
        "cursor-default rounded px-2 py-0.5 outline-none transition-colors",
        "data-[state=open]:bg-white/25 data-[state=open]:dark:bg-white/20",
        "hover:bg-white/15",
        "focus-visible:ring-2 focus-visible:ring-white/70",
        className,
      ].join(" ")}
    >
      {children}
    </Menubar.Trigger>
  );
}

export function MenuContent({ children }: { children: React.ReactNode }) {
  return (
    <Menubar.Portal>
      <Menubar.Content
        align="start"
        sideOffset={4}
        alignOffset={-4}
        className={CONTENT_CLASS}
      >
        {children}
      </Menubar.Content>
    </Menubar.Portal>
  );
}

export function MenuItem({
  children,
  onSelect,
  shortcut,
  disabled,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  shortcut?: string;
  disabled?: boolean;
}) {
  return (
    <Menubar.Item className={ITEM_CLASS} onSelect={onSelect} disabled={disabled}>
      {children}
      {shortcut && (
        <span className="ml-auto pl-6 text-xs tabular-nums opacity-55">
          {shortcut}
        </span>
      )}
    </Menubar.Item>
  );
}

/** An item that renders as an anchor — used for real outbound links. */
export function MenuLinkItem({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Menubar.Item className={ITEM_CLASS} asChild>
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Menubar.Item>
  );
}

export function MenuSeparator() {
  return (
    <Menubar.Separator className="my-1 h-px bg-foreground/10" />
  );
}

/**
 * Generic over the value so a caller with a union type — the appearance
 * setting, say — keeps it end to end instead of casting a bare string back.
 */
export function MenuRadioGroup<T extends string>({
  value,
  onValueChange,
  children,
}: {
  value: T;
  onValueChange: (v: T) => void;
  children: React.ReactNode;
}) {
  return (
    <Menubar.RadioGroup
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
    >
      {children}
    </Menubar.RadioGroup>
  );
}

export function MenuRadioItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <Menubar.RadioItem value={value} className={`${ITEM_CLASS} pl-7`}>
      <Menubar.ItemIndicator className="absolute left-2">
        <Check className="size-3.5" strokeWidth={3} />
      </Menubar.ItemIndicator>
      {children}
    </Menubar.RadioItem>
  );
}
