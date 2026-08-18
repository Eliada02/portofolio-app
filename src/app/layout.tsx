import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Apple's San Francisco can't be shipped as a webfont. On Apple devices the
// stack in globals.css picks up the real thing via `-apple-system`; everywhere
// else Inter stands in — it's the closest widely available match to SF Pro.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eliada Salla — Portfolio",
  description:
    "The portfolio of Eliada Salla, a Full-Stack Developer working with React, Next.js, TypeScript, NestJS and PostgreSQL — presented as a macOS desktop. Open the apps to explore projects, experience and skills.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Draw behind the notch / home indicator; the dock pads for the safe area.
  viewportFit: "cover",
  // Kept in sync with the appearance by the theme store.
  themeColor: "#2a1220",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The inline script below mutates `class` and `style` on <html> before
    // React hydrates, so the server markup can't match by definition.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Must run before first paint — see lib/theme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-wallpaper-base h-full overflow-hidden overscroll-none">
        {children}
      </body>
    </html>
  );
}
