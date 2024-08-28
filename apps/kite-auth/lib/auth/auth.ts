import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { findUser, initializeUser, linkProfile } from "./account";
import { DynamoDB, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import Twitter from "next-auth/providers/twitter";
import Google from "next-auth/providers/google";

const isProduction = process.env.NODE_ENV === "production";

const config: DynamoDBClientConfig = {
	credentials: {
		accessKeyId: process.env.AUTH_DYNAMODB_ID || "",
		secretAccessKey: process.env.AUTH_DYNAMODB_SECRET || "",
	},
	region: process.env.AUTH_DYNAMODB_REGION,
};

const client = DynamoDBDocument.from(new DynamoDB(config), {
	marshallOptions: {
		convertEmptyValues: true,
		removeUndefinedValues: true,
		convertClassInstanceToMap: true,
	},
});

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
		async jwt({ token, user, trigger, session, profile, account }) {
			if (user && profile && account) {
				await linkProfile(user.id, account.provider, profile);
				const data = await findUser(user.id as string);
				token.role = data?.role;
				token.google = data?.google?.name;
				token.twitter = data?.twitter?.name;
			}
			if (trigger === "update" && session) {
				const data = await findUser(token.sub as string);
				token.role = data?.role;
				token.google = data?.google?.name;
				token.twitter = data?.twitter?.name;
			}
			return token;
		},

		async session({ session, token }) {
			session.user.id = token.sub;
			session.user.role = token.role;
			session.user.google = token.google;
			session.user.twitter = token.twitter;
			return session;
		},
	},
});
