/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com','images.unsplash.com'],
  },
  // Add any other Next.js configuration options here
  webpack: (config) => {
    // This is needed for the 3D model libraries
    config.externals.push({
      'sharp': 'commonjs sharp',
    });
    return config;
  },
};

export default nextConfig;
