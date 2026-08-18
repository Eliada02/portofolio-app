# Portfolio — Eliada Salla

**Full-Stack Software Engineer building scalable, high-performance web products.**

An interactive CV, built as a miniature macOS desktop that runs in the browser.

🔗 **[eliada-salla.netlify.app](https://eliada-salla.netlify.app/)**

---

## Why it's built this way

A CV is a page people skim in fifteen seconds. This is the same information —
experience, projects, skills, contact — presented as an operating system you
can actually use, so that exploring it *is* the demonstration. The dock, the
draggable windows, the boot animation and the working terminal are the
portfolio content: they show how I build interfaces rather than describing it.

The metaphor is also the biggest usability risk: a visitor who doesn't realise
the icons are clickable just sees a wallpaper. So the site states its purpose
before it shows off — a **START HERE.md** file sits on the desktop and opens
automatically after login, a purpose pill names the interface, and a one-shot
notification explains the interaction.

---

## What you can do with it

Boot the page and a handwritten "hello" draws itself, then lifts to reveal a
macOS Sequoia lock screen: an animated mesh-gradient wallpaper, your avatar
orbited by the stack, a live menu bar, a typewriter boot log, and a Touch ID
sensor to unlock.

### Apps

| App | What's inside |
| --- | --- |
| **START HERE** | Who I am, what this site is, and the three things you probably want |
| **About Me** | Overview, background and links — a Finder-style split view |
| **Projects** | A bento grid; each card states the problem, the solution and the stack |
| **Experience** | Roles, courses and education, picked from a source list |
| **Skills** | The stack, grouped by where it lives, with brand marks |
| **Contact** | An Apple Mail composer that hands off to your real mail client |
| **Terminal** | A zsh-style shell with Tab completion, inline suggestions and history |
| **VS Code** | This portfolio's own source, syntax-highlighted |
| **Figma** | The live design system — real tokens, not screenshots of them |

### Desktop

Windows drag from the title bar, resize from any edge or corner, minimise,
zoom and stack by z-order; only the frontmost one lights its traffic lights.
The dock magnifies to the 1.4× the HIG specifies and marks running apps.

Desktop shortcuts — **START HERE.md**, **VS Code**, **Figma**, **GitHub**,
**WhatsApp** and a **Projects** folder — sit on the wallpaper beneath every
window and can be dragged anywhere. Single click selects, double click opens.
GitHub and WhatsApp are aliases, badged with an arrow, and open off-site.

The menu bar's menus are real — hide, quit, copy the email address, switch
appearance — and Control Center carries Wi-Fi, Bluetooth, appearance and a
brightness slider that genuinely dims the wallpaper.

### Appearance

Light and dark are both first-class, chosen from the dock, Control Center, the
menu bar or `theme dark` in the terminal, and remembered between visits. An
inline script in `<head>` applies the saved appearance **before the first
paint**, so dark-mode visitors never see a flash of light.

### On a phone

The desktop metaphor collapses into an iOS 18 home screen. Tapping an icon
presents the app as a **modal sheet**; drag the grabber down — or swipe the
home indicator — to send it back. Swiping up from the bottom bar brings the
last app back.

Hold an app icon to enter **jiggle mode**, then drag to rearrange the grid,
exactly as iOS does. The dock dims during editing to show it's out of scope.

---

## Architecture

```
src/
  app/
    layout.tsx              fonts, metadata, pre-paint theme script
    globals.css             palette, Sequoia materials, rim + elevation utilities
    icon.svg                tab icon
  lib/
    data.ts                 ← all CV content lives here, and nowhere else
    apps.tsx                the app registry: id, name, icon art, component
    desktopItems.ts         what sits on the desktop (apps, folders, aliases)
    store.ts                zustand: window geometry, z-order, system state
    theme.ts                appearance store + the pre-paint inline script
    contact.ts              WhatsApp + prefilled mailto, built in one place
    sourceFiles.ts          the excerpts the Code app displays
    highlight.ts            a small syntax highlighter
    useWindowGeometry.ts    mirrors stored geometry into motion values
    useHomeReorder.ts       iPhone long-press / drag-to-rearrange
    usePointerParallax.ts   normalised pointer signal for parallax
    useBattery.ts           Battery Status API, with a silent fallback
  components/
    os/                     the shell: MenuBar, Dock, WindowFrame, SplitView…
    os/boot/                the lock screen: backdrop, orbit, Touch ID, log
    os/mobile/              the phone shell: HomeScreen, MobileSheet, StatusBar
    apps/                   the app bodies
```

---

## Decisions worth knowing

**Content is data, not markup.** Everything a recruiter reads comes from
`src/lib/data.ts`. Updating the CV means editing one file — every app, the
terminal, the boot log and the page metadata follow.

**Desktop and mobile are separate trees over shared state.** They're genuinely
different interaction models, not one layout at two breakpoints, so
`MobileShell` and `DesktopShell` render independently against the same store.

**Dragging never re-renders React.** A window's position and size live in
Framer motion values, not in state: a drag writes straight to the compositor
and only commits to the store once, when the gesture ends. `WindowFrame` is
purely presentational, so the same chrome would serve any window.

**The dragged icon doesn't move in the DOM.** On the phone's home screen,
reordering the dragged item mid-gesture would move its own layout origin — and
since a drag transform is relative to that origin, the icon would jump out from
under your finger on every swap. Instead the grid paints a preview order with a
gap at the target, hides the real icon, and floats a copy under the finger.

**Vibrancy is a material, not a blur.** `globals.css` defines the four macOS
thicknesses as utilities. The part that's easy to miss is saturation — blurring
averages hues toward grey, so every material pushes saturation past 100% to
keep the wallpaper's colour alive through the glass. The 1px rim is a masked
gradient rather than a border, so the top edge can catch light and fall off.

**The wallpaper is painted, not photographed.** It scales to any viewport,
costs nothing to load, and can respond to appearance and the brightness slider
— which a JPEG can't.

**The icons are drawn, not downloaded.** `components/os/MacIcons.tsx` and
`ToolIcons.tsx` draw each icon as inline SVG, clipped to a real squircle path
rather than a `border-radius` — a few KB total, sharp at any dock
magnification. Brand marks come from `simple-icons`, so they're official paths
rather than approximations.

**No dead affordances.** The Download CV button doesn't render until a CV
exists; project links only appear when there's something to link to; the
battery reads the real level where the browser exposes one and stays quiet
where it doesn't.

---

## Design system

Three pinks, defined once in `app/globals.css` and exposed as both semantic
tokens and `brand-*` utilities:

| | | Role |
| --- | --- | --- |
| `#9F2B68` | magenta | actions — deep enough to carry white text at 6.9:1 |
| `#DE3163` | cerise | accents, focus rings, the bright half of every gradient |
| `#F2D2BD` | sand | the warm neutral: surfaces, borders, dark-mode text |

Every foreground/surface pair was measured rather than eyeballed; nothing ships
below the WCAG AA 4.5:1 threshold for body text. Open the **Figma** app to see
the palette, the four materials, the type scale and the radii rendered live.

---

## Accessibility

- Menus, tooltips and popovers are Radix primitives — full keyboard navigation,
  focus management and typeahead.
- Split views are exposed as tab sets, with arrow-key navigation and
  `aria-labelledby` tying each panel to its tab.
- Desktop icons are arrow-navigable; window controls, dock items and every
  outbound link carry explicit labels that describe the outcome.
- Touch targets meet the 44pt minimum.
- `prefers-reduced-motion` is honoured throughout: dock magnification, the
  jiggle, the orbit, the parallax and the boot log all stand still.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Radix UI · shadcn/ui · zustand · Motion · lucide-react · simple-icons

---

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # static export into out/
npm run lint
```

---

## Making it yours

Fork it, then edit `src/lib/data.ts` — profile, projects, experience, courses,
education and skills all come from that file.

| Want to… | Do this |
| --- | --- |
| Change any content | Edit `src/lib/data.ts` |
| Use a real photo | Drop it in `public/`, set `profile.photo = "/avatar.jpg"` |
| Offer a CV download | Drop the PDF in `public/`, set `profile.resume` |
| Add project screenshots | Drop images in `public/`, set `screenshot` + `screenshotAlt` |
| Add or remove an app | `src/lib/apps.tsx` (and `AppId` in `src/lib/store.ts`) |
| Change what's on the desktop | `src/lib/desktopItems.ts` |
| Recolour everything | The three brand hexes at the top of `src/app/globals.css` |

### Not yet supplied

These are wired but waiting on assets — each is a one-line change once the file
exists, and each degrades gracefully in the meantime rather than shipping
broken:

- **`profile.photo`** — the avatar falls back to a drawn SVG portrait.
- **`profile.resume`** — the Download CV button is hidden.
- **`project.screenshot`** — cards paint the project's accent gradient inside
  the browser frame. The frame reserves a fixed `16/10` box, so adding a
  screenshot causes **no layout shift**.

---

## Deployment

`next build` with `output: "export"` writes a fully static site to `out/`,
which Netlify serves directly (`netlify.toml` holds the build settings). There
is no server runtime: the whole app is client components over a single route.

> **Note for Windows:** if a local build fails with
> `EBUSY: resource busy or locked, rmdir 'out'`, a process is holding the `out`
> directory open — usually a stale `next start`. The build itself has already
> succeeded at that point; only the export copy fails. CI is unaffected.

---

Built by [Eliada Salla](https://github.com/Eliada02) — Full-Stack Developer,
Tirana, Albania.
