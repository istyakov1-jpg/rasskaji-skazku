/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.kie.ai',
      },
      {
        protocol: 'https',
        hostname: '**.aiquickdraw.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      // Flux может отдавать с разных CDN — разрешаем любые https
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;