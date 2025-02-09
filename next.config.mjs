/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,
  experimental: {
    appDir: true,
  },

  // Conditionally exclude API routes during Netlify build
  webpack: (config, { isServer, dev }) => {
    // Check if we're building on Netlify
    if (process.env.NETLIFY && !dev) {
      console.log("Excluding API routes from Netlify build...");
      config.module.rules.push({
        test: /app\/api\/.+\.(js|ts|tsx)$/,
        loader: "ignore-loader",
      });
    }
    return config;
  },

  // Disable API routes generation in production build on Netlify
  async headers() {
    return process.env.NETLIFY
      ? [
          {
            source: "/api/:path*",
            headers: [
              {
                key: "x-api-disabled",
                value: "true",
              },
            ],
          },
        ]
      : [];
  },
};

export default nextConfig;
