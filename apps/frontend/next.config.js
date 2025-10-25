/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@prontoplus/ui'],
  experimental: {
    optimizePackageImports: ['@prontoplus/ui'],
  },
};

module.exports = nextConfig;
