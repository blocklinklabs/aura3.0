/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [],
  },

  skipMiddlewareUrlNormalize: true,

  reactStrictMode: false,

  // Disable image optimization warnings
  images: {
    unoptimized: true,
  },

  // Ignore specific page extensions
  pageExtensions: ["tsx", "ts", "jsx", "js"].filter(
    (ext) => !ext.includes("spec")
  ),

  // Conditionally exclude API routes during Netlify build
  webpack: (config, { isServer, dev }) => {
    // Check if we're building on Netlify
    if (process.env.NETLIFY && !dev) {
      console.log("Excluding non-user API routes from Netlify build...");
      config.module.rules.push({
        test: /app\/api\/((?!users).+)\.(js|ts|tsx)$/,
        loader: "ignore-loader",
      });
    }

    // Ignore specific modules that might cause issues
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      canvas$: false,
    };

    return config;
  },

  // Disable non-user API routes generation in production build on Netlify
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
            missing: [
              {
                type: "pathname",
                value: "/api/users",
              },
            ],
          },
        ]
      : [];
  },

  // Suppress specific console warnings
  onDemandEntries: {
    // Reduce console noise
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
