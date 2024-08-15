import Twitter from "next-auth/providers/twitter";
import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";
const isProduction = process.env.NODE_ENV === "production";

export default {
	providers: [Google, Twitter],
	secret: process.env.AUTH_SECRET,
	cookies: {
		sessionToken: {
			name: `${isProduction ? "__Secure-" : ""}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
				domain: isProduction ? ".kitebooth.com" : "localhost",
			},
		},
		callbackUrl: {
			name: `${isProduction ? "__Secure-" : ""}next-auth.callback-url`,
			options: {
				sameSite: "lax",
				path: "/",
				secure: isProduction,
				domain: isProduction ? ".kitebooth.com" : "localhost",
			},
		},
		csrfToken: {
			name: "__Host-next-auth.csrf-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
			},
		},
	},
} satisfies NextAuthConfig;
