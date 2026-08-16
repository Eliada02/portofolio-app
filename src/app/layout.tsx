import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
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
  themeColor: "#2a1220",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden overscroll-none bg-[#2a1220]">
        {children}
      </body>
    </html>
  );
}
