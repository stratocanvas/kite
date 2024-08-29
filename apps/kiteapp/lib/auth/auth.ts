import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
	session: { strategy: "jwt" },
	trustHost: true,
	adapter: DynamoDBAdapter(client),
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
	callbacks: {
		async session({ session, token }) {
			session.user.id = token.sub as string;
			session.user.email = undefined;

			return session;
		},
	},
});
