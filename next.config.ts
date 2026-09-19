import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/confirm-signup/:path*", headers: [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Cache-Control", value: "private, no-store" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'; form-action 'self'" },
    ] }];
  },
};

export default nextConfig;
