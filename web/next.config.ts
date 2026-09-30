import type { NextConfig } from "next";

const wordpress = new URL(process.env.WORDPRESS_URL ?? "http://headless-wp.ddev.site");

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to optimize Media Library images. WordPress returns https URLs,
    // so allow both protocols for the WordPress host.
    remotePatterns: [
      { protocol: "https", hostname: wordpress.hostname, pathname: "/wp-content/uploads/**" },
      { protocol: "http", hostname: wordpress.hostname, pathname: "/wp-content/uploads/**" },
    ],
    // *.ddev.site resolves to 127.0.0.1, which Next 16 blocks by default. Local development only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production" || wordpress.hostname.endsWith(".ddev.site"),
  },
};

export default nextConfig;
