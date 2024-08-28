import NextAuth from "next-auth";
import { initializeUser, linkProfile } from "./account";

import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import Twitter from "next-auth/providers/twitter";
import Google from "next-auth/providers/google";
import client from "../db";

const isProduction = process.env.NODE_ENV === "production";

export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	adapter: DynamoDBAdapter(client),
	session: { strategy: "jwt" },
	providers: [
		Google({
			authorization: {
				params: {
					scope: "openid profile",
					access_type: "offline",
					prompt: "consent",
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
			name: `${isProduction ? "__Secure-" : ""}authjs.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
				domain: isProduction
					? `.${process.env.NEXT_PUBLIC_BASE_URL}`
					: "localhost",
			},
		},
		callbackUrl: {
			name: `${isProduction ? "__Secure-" : ""}authjs.callback-url`,
			options: {
				sameSite: "lax",
				path: "/",
				secure: isProduction,
				domain: isProduction
					? `.${process.env.NEXT_PUBLIC_BASE_URL}`
					: "localhost",
			},
		},
		csrfToken: {
			name: "__Host-authjs.csrf-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
			},
		},
	},

	events: {
		async createUser({ user }) {
			await initializeUser(user.id as string);
		},
	},
	callbacks: {
		async jwt({ token, user, profile, account }) {
			if (user && profile && account) {
				await linkProfile(user.id, account.provider, profile);
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.sub;
			session.user.name=undefined
			session.user.image=undefined
			return session;
		},
	},
});
