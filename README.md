# Portfolio — Eliada Salla

An interactive CV, built as a miniature macOS desktop that runs in the browser.

**Live purpose:** a CV is a page people skim in fifteen seconds. This is the same
information — experience, projects, skills, contact — presented as an operating
system you can actually use, so that exploring it *is* the demonstration. The
dock, the draggable windows, the boot animation and the working terminal are the
portfolio content: they show how I build interfaces rather than describing it.

## What you can do with it

Boot the page and you land on a login tile after a handwritten "hello" draws
itself, the way a Mac greets you on first run. Past that:

| App | What's inside |
| --- | --- |
| **About Me** | Who I am, where I work, links — a Finder-style split view |
| **Projects** | A bento grid; cards carry live-demo and source buttons, and open a detail sheet |
| **Experience** | Roles, courses and education, picked from a source list |
| **Skills** | The stack, grouped by where it lives, with brand marks |
| **Contact** | An Apple Mail composer that hands off to your real mail client |
| **Terminal** | A zsh-style shell with Tab completion, inline suggestions and history |

Windows drag from the title bar, resize from any edge or corner, minimise,
zoom and stack by z-order; only the frontmost one lights its traffic lights.
The dock magnifies to 1.4x under the cursor and marks running apps. The menu
bar's menus are real — hide, quit, copy the email address, switch appearance —
and Control Center carries Wi-Fi, Bluetooth, appearance and a brightness
slider that genuinely dims the wallpaper.

Light and dark are both first-class, chosen from the dock, Control Center, the
menu bar or `theme dark` in the terminal, and remembered between visits. An
inline script in `<head>` applies the saved appearance before the first paint,
so dark-mode visitors never see a flash of light.

On a phone the whole thing becomes an iOS 18 home screen instead: tap an icon
to present the app as a modal sheet, then drag the grabber down — or swipe the
home indicator — to send it back.

## How it's put together

```
src/
  lib/data.ts             ← all CV content lives here, and nowhere else
  lib/apps.tsx            ← the app registry: id, name, icon art, component
  lib/store.ts            ← zustand store: window geometry, z-order, system state
  lib/theme.ts            ← appearance store + the pre-paint inline script
  lib/useWindowGeometry.ts← mirrors stored geometry into motion values
  components/os/          ← the shell: MenuBar, Dock, WindowFrame, SplitView…
  components/os/mobile/   ← the phone shell: HomeScreen, MobileSheet, StatusBar
  components/apps/        ← the six app bodies
  app/globals.css         ← the palette and the Sequoia materials, as tokens
```

Three decisions worth knowing if you're reading the source:

**Content is data, not markup.** Everything a recruiter reads comes from
`src/lib/data.ts`. Updating the CV means editing one file — every app, the
terminal and the page metadata follow.

**Desktop and mobile are separate trees over shared state.** They're genuinely
different interaction models, not one layout at two breakpoints, so
`MobileShell` and `DesktopShell` render independently against the same store.

**Dragging never re-renders React.** A window's position and size live in
Framer motion values, not in state: a drag writes straight to the compositor
and only commits to the store once, when the gesture ends. `WindowFrame` is
purely presentational, so the same chrome would serve any window.

**Vibrancy is a material, not a blur.** `globals.css` defines the four macOS
thicknesses as utilities. The part that is easy to miss is saturation — blurring
averages hues toward grey, so every material pushes saturation past 100% to keep
the wallpaper's colour alive through the glass. The 1px rim is a masked
gradient rather than a border, so the top edge can catch light and fall off.

**The icons are drawn, not downloaded.** `components/os/MacIcons.tsx` hand-draws
each app icon in the macOS visual language as inline SVG, clipped to a real
squircle path rather than a `border-radius` — a few KB total, sharp at any dock
magnification.

## Design system

The palette is built from three pinks, defined once in `app/globals.css` and
exposed as both semantic tokens and `brand-*` utilities:

| | | Role |
| --- | --- | --- |
| `#9F2B68` | magenta | actions — deep enough to carry white text at 6.9:1 |
| `#DE3163` | cerise | accents, focus rings, the bright half of every gradient |
| `#F2D2BD` | sand | the warm neutral: surfaces, borders, dark-mode text |

Every foreground/surface pair was measured rather than eyeballed; nothing ships
below the WCAG AA 4.5:1 threshold for body text.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Radix UI · shadcn/ui · zustand · Motion · lucide-react · simple-icons

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm start        # serve the build
npm run lint
```

## Making it yours

Fork it, then edit `src/lib/data.ts` — profile, projects, experience, courses,
education and skills all come from that file. Add or remove an app in
`src/lib/apps.tsx`, and recolour the whole thing by changing the three brand
hexes at the top of `src/app/globals.css`.

---

Built by [Eliada Salla](https://github.com/Eliada02) — Full-Stack Developer,
Tirana, Albania.
