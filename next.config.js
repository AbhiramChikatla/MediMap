/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['img.clerk.com','images.unsplash.com'], // Allow Clerk images
  },
  webpack: (config) => {
    // Resolve issues with sharp library for 3D model libraries
    config.externals = [...(config.externals || []), { sharp: 'commonjs sharp' }];
    return config;
  },
};

module.exports = nextConfig;