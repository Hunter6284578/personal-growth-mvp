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
            // 说明：
            // - script-src 仍保留 'unsafe-inline'：项目通过 layout.tsx 注入
            //   了主题初始化内联脚本和 JSON-LD 内联脚本，且 proxy.ts 因
            //   Next.js 16 中间件 204 崩溃问题已禁用（matcher: []），无法
            //   在中间件层生成每请求 nonce。后续如需彻底去 'unsafe-inline'，
            //   需要先把 proxy.ts 启用并修复 204 崩溃。
            // - 已移除 'unsafe-eval'：项目代码与 Next.js 16 standalone
            //   生产构建均不使用 eval/new Function。
            // - 新增 object-src 'none'、base-uri 'self'、form-action 'self'、
            //   frame-ancestors 'self'、upgrade-insecure-requests、
            //   block-all-mixed-content：分别封堵 Flash/插件滥用、<base>
            //   劫持、表单外跳、点击劫持、明文下级加载、混合内容。
            value:
              "default-src 'self'; " +
              "img-src 'self' data: blob: https:; " +
              "style-src 'self' 'unsafe-inline' https:; " +
              "script-src 'self' 'unsafe-inline' https:; " +
              "connect-src 'self' https:; " +
              "font-src 'self' https: data:; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'self'; " +
              "upgrade-insecure-requests; " +
              "block-all-mixed-content; " +
              "report-uri /api/csp-report",
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
