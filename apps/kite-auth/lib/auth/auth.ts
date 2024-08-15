import NextAuth from "next-auth";
import authConfig from "./auth.config";
import client from "@/lib/db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { findUser, initializeUser, linkProfile } from "./account";

export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	adapter: MongoDBAdapter(client, { databaseName: "auth" }),
	session: { strategy: "jwt" },
	...authConfig,
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
