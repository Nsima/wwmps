import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/query',
        destination: 'http://localhost:3000/api/query',
      },
    ];
  },
};

export default nextConfig;
