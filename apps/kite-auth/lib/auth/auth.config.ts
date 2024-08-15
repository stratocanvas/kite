import Twitter from "next-auth/providers/twitter";
import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";
const isProduction = process.env.NODE_ENV === "production";

export default {
	providers: [
		Google({
			authorization: {
				params: {
					scope: "openid profile",
				},
			},
		}),
		Twitter({
			authorization: {
				params: {
					scope: "offline.access",
				},
			},
		}),
	],
	cookies: {
		sessionToken: {
			name: `${isProduction ? "__Secure-" : ""}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
				domain: isProduction ? `.${process.env.NEXT_PUBLIC_BASE_URL}` : "localhost",
			},
		},
		callbackUrl: {
			name: `${isProduction ? "__Secure-" : ""}next-auth.callback-url`,
			options: {
				sameSite: "lax",
				path: "/",
				secure: isProduction,
				domain: isProduction ? `.${process.env.NEXT_PUBLIC_BASE_URL}` : "localhost",
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
