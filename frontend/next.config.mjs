/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*"
      },
      {
        source: "/health",
        destination: "http://localhost:3000/health"
      }
    ];
  }
};

export default nextConfig;
