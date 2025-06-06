/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com'], // Allow Clerk images
  },
  webpack: (config) => {
    // Resolve issues with sharp library for 3D model libraries
    config.externals = [...(config.externals || []), { sharp: 'commonjs sharp' }];
    return config;
  },
};

module.exports = nextConfig;