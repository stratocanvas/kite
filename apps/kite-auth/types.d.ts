import { JWT } from "next-auth/jwt";
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			role?: string;
		} & DefaultSession["user"];
	}

	interface User {
		role: string;
		twitter: {
			data: {
				id: string;
				name: string;
				username: string;
				profile_image_url: string;
				addedAt: Date;
			};
		};
		google: {
			id: string;
			name: string;
			picture: string;
			addedAt: Date;
		};
		id: string;
	}

	interface Profile {
		data: {
			id: string;
			name: string;
			username: string;
			profile_image_url: string;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		token: {
			id: string;
		};
	}
}
// The `JWT` interface can be found in the `next-auth/jwt` submodule
