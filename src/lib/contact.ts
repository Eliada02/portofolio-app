import { profile } from "@/lib/data";

/**
 * Outbound contact links, built in one place.
 *
 * Every surface that offers "get in touch" — the Contact app, the desktop
 * WhatsApp shortcut, the menu bar — routes through here, so the prefilled
 * wording can't drift between them and the phone number is normalised once.
 */

/** wa.me wants digits only: no +, spaces or dashes. */
export const whatsappNumber = profile.phone.replace(/\D/g, "");

export const DRAFT_SUBJECT = `Opportunity / Project Inquiry — ${profile.name}`;

export const DRAFT_BODY = `Hi ${profile.name.split(" ")[0]},

I visited your portfolio and would love to connect regarding
`;

const WHATSAPP_GREETING = `Hi ${profile.name.split(" ")[0]}, I saw your portfolio and would love to connect.`;

export const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  WHATSAPP_GREETING
)}`;

/**
 * A mailto: with the draft prefilled.
 *
 * `encodeURIComponent` rather than `URLSearchParams`: the latter encodes
 * spaces as `+`, which mail clients render literally in a subject line.
 */
export function mailtoDraft({
  subject = DRAFT_SUBJECT,
  body = DRAFT_BODY,
}: { subject?: string; body?: string } = {}) {
  const query = [
    subject.trim() && `subject=${encodeURIComponent(subject.trim())}`,
    body.trim() && `body=${encodeURIComponent(body)}`,
  ]
    .filter(Boolean)
    .join("&");

  return `mailto:${profile.email}${query ? `?${query}` : ""}`;
}

/**
 * The href for a social entry. The email one routes through the prefilled
 * draft rather than the bare `mailto:` in `data.ts`, so every path to the
 * inbox opens the same message.
 */
export function socialHref(social: { label: string; url: string }) {
  return social.label === "Email" ? mailtoDraft() : social.url;
}

/** Email links stay in the current tab; everything else opens a new one. */
export const socialTarget = (label: string) =>
  label === "Email" ? undefined : "_blank";
