/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,

};
//const withPWA = require("next-pwa")({
//  dest: "public",
//});
module.exports = nextConfig;
//module.exports = withPWA(nextConfig);

module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.kitebooth.com",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "kiteapp.s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.kitebooth.com",
        port: "",
        pathname: "/api/og/booth/**",
      },
    ],
  },
};
