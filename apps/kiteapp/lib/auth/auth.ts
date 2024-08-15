import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
	session: { strategy: "jwt" },
	...authConfig,
	callbacks: {
		async session({ session, token }) {
			session.user.id = token.sub as string;
			session.user.role = token.role as string;
			session.user.email = undefined;

			return session;
		},
	},
});
