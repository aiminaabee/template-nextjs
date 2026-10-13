const checkEnvVariables = require("./check-env-variables");

if (process.env.NODE_ENV !== "test") {
  checkEnvVariables();
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [50, 75, 100],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "aiminaabee-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "aiminaabee-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "aiminaabee-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "aiminaabee-do-bucket.sgp1.digitaloceanspaces.com",
      },
    ],
  },
};

module.exports = nextConfig;
