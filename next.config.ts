import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const remotePatterns = [
  {
    protocol: "https" as const,
    hostname: "**.supabase.co",
  },
];

if (supabaseHostname) {
  remotePatterns.push({
    protocol: "https" as const,
    hostname: supabaseHostname,
  });
}

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https:; font-src 'self' https: data:; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ]
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
