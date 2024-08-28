import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { findUser, initializeUser, linkProfile } from "./account";
import { DynamoDB, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";


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
