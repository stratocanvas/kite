/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
	openAnalyzer: false,
});

const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
};
module.exports = nextConfig;

module.exports = withBundleAnalyzer(nextConfig);

module.exports = {
	experimental: {
		serverActions: {
			bodySizeLimit: "4.5mb",
		},
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
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
				hostname: "cvyhfxujgfmkjngufwpb.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
};
