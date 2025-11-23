import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: './',
  images: {
    unoptimized: true,
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
                default-src 'self';
                script-src 'self' 'unsafe-eval' 'unsafe-inline';
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: https:;
                font-src 'self' data:;
                connect-src 'self' http://localhost:* ws://localhost:* https://api.github.com;
              `.replace(/\s{2,}/g, ' ').trim()
          },
        ],
      },
    ];
  },
};

export default nextConfig;
