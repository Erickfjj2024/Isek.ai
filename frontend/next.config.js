/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // required for Docker production build
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
