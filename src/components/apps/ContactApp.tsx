"use client";

import { useState } from "react";
import { Check, Copy, Phone, Send } from "lucide-react";
import { profile } from "@/lib/data";
import { SocialIcon } from "@/components/BrandIcon";

/** A Mail compose header row: label, then a borderless field. */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-2">
      <label
        htmlFor={htmlFor}
        className="w-14 shrink-0 text-right text-[13px] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function ContactApp() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
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

  // A static site has no inbox to post to, so Send hands off to the user's
  // real mail client with the message already filled in.
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (subject.trim()) params.set("subject", subject.trim());
    if (body.trim()) params.set("body", body.trim());
    const query = params.toString();
    window.location.href = `mailto:${profile.email}${query ? `?${query}` : ""}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Compose toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">
            New Message
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            Opens in your mail app — nothing is sent from this page.
          </p>
        </div>
        <button
          type="submit"
          form="compose"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95"
        >
          <Send className="size-4" /> Send
        </button>
      </div>

      <form
        id="compose"
        onSubmit={send}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Field label="To:" htmlFor="compose-to">
          <span
            id="compose-to"
            className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-primary/12 px-2 py-0.5 text-[13px] font-medium text-primary"
          >
            <span className="truncate">{profile.name}</span>
            <span className="truncate opacity-70">&lt;{profile.email}&gt;</span>
          </span>
        </Field>

        <Field label="Subject:" htmlFor="compose-subject">
          <input
            id="compose-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Let's work together"
            // 16px on touch keeps iOS Safari from zooming the field on focus.
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 @sm:text-[13px]"
          />
        </Field>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Message"
          placeholder={`Hi ${profile.name.split(" ")[0]} —`}
          className="scroll-overlay min-h-0 flex-1 resize-none bg-transparent p-4 text-base leading-relaxed outline-none placeholder:text-muted-foreground/60 @sm:text-sm"
        />
      </form>

      {/* Quick actions — the Messages-style row under the compose sheet. */}
      <div className="shrink-0 border-t border-border bg-foreground/3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyEmail}
            aria-label={`Copy email address ${profile.email}`}
            className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:bg-secondary"
          >
            {copied ? (
              <Check className="size-3.5 shrink-0 text-primary" />
            ) : (
              <Copy className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{copied ? "Copied" : profile.email}</span>
          </button>

          <a
            href={`tel:${profile.phone.replace(/\s/g, "")}`}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:bg-secondary"
          >
            <Phone className="size-3.5 shrink-0 text-muted-foreground" />
            {profile.phone}
          </a>

          <div className="ml-auto flex items-center gap-1.5">
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="grid size-9 touch-manipulation place-items-center rounded-full border border-border bg-card transition hover:bg-secondary"
              >
                <SocialIcon label={social.label} className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
