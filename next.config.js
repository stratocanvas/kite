/** @type {import('next').NextConfig} */
const nextConfig = {};
const withPWA = require('next-pwa')({
	dest: 'public',
  });
module.exports = nextConfig;
module.exports = withPWA(nextConfig);

module.exports = {
	
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
			{
				protocol: "https",
				hostname: "www.kitebooth.com",
				port: "",
				pathname: "/api/og/booth/**",
			},
		],
	},
};

