/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep dev output separate from production builds so concurrent commands
  // cannot overwrite the chunks used by a running dev server.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: {
    domains: ['encrypted-tbn0.gstatic.com', 'images.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
    ],
  },
};

export default nextConfig;
