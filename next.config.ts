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
  images: {
    remotePatterns,
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
