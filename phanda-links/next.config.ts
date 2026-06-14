import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore: eslint might not be in NextConfig type depending on the version
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
