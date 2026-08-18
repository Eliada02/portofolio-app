import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site into out/ at build time. The app is a single
  // route of client components with no server work, so there is nothing for a
  // Node runtime to do — this lets any static host (Netlify) serve it directly.
  output: "export",
  // Pin the workspace root to this project so Next doesn't pick up an
  // unrelated lockfile from a parent directory.
  turbopack: {
    root: __dirname,
  },
  images: {
    // `output: "export"` has no server to run the optimizer on, so images
    // must be served as authored. Required for next/image to build at all
    // under a static export.
    unoptimized: true,
    // Next 16 allowlists optimizer qualities and defaults to [75]; requesting
    // anything outside the list 400s. Kept at hand for when a photo asset
    // needs more than the default.
    qualities: [75, 90],
  },
};

export default nextConfig;
