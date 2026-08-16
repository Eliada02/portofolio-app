"use client";

import { profile } from "@/lib/data";
import { Copy, Check, Mail, Phone } from "lucide-react";
import { SocialIcon } from "@/components/BrandIcon";
import { useState } from "react";

export function ContactApp() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    // `my-auto` centres the card while still letting it scroll when the
    // window is too short — plain `justify-center` would clip the top.
    <div className="h-full overflow-y-auto">
      <div className="my-auto flex min-h-full flex-col items-center justify-center p-5 text-center @sm:p-8">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-cerise to-brand-magenta text-white shadow-lg">
          <Mail className="size-8" />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight @sm:text-xl">
          Let&apos;s work together
        </h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Have a project in mind or just want to say hi? My inbox is always
          open.
        </p>

        <button
          onClick={copyEmail}
          className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-medium transition hover:bg-secondary @sm:text-base"
        >
          <span className="truncate">{profile.email}</span>
          {copied ? (
            <Check className="size-4 text-primary" />
          ) : (
            <Copy className="size-4 text-muted-foreground" />
          )}
        </button>

        <a
          href={`mailto:${profile.email}`}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Mail className="size-4" /> Send an email
        </a>

        <a
          href={`tel:${profile.phone.replace(/\s/g, "")}`}
          className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Phone className="size-3.5" /> {profile.phone}
        </a>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              title={s.label}
              aria-label={s.label}
              className="grid size-11 touch-manipulation place-items-center rounded-full border border-border bg-card transition hover:bg-secondary"
            >
              <SocialIcon label={s.label} className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
