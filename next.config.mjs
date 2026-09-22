/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // JSON-LD через dangerouslySetInnerHTML требует 'unsafe-inline'.
      // mc.yandex.ru — Яндекс.Метрика (включается только при NEXT_PUBLIC_YM_ID).
      "script-src 'self' 'unsafe-inline' https://mc.yandex.ru",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://mc.yandex.ru",
      "media-src 'self'",
      "connect-src 'self' https://mc.yandex.ru https://yandex.ru",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Медиа-ассеты иммутабельны в рамках релиза — агрессивное кэширование
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
