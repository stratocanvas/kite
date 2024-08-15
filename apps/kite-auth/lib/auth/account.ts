"use server";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { signIn, signOut } from "./auth";

const db = client.db("auth");
const accounts = db.collection("accounts");
const users = db.collection("users");

/**
 * 사용자의 계정을 초기화합니다.
 * @param id - 사용자 UID
 * @returns 로그인용 계정 정보
 */
export const initializeUser = async (id: string) => {
	return users.updateOne(
		{
			_id: new ObjectId(id),
		},
		{
			$set: {
				role: "user",
				createdAt: new Date(),
			},
		},
		{
			upsert: true,
		},
	);
};

/**
 * 사용자의 프로필을 가져옵니다.
 * @param id - 사용자의 UID
 * @returns 사용자의 프로필
 */
export const findUser = async (id: string) => {
	return users.findOne({ _id: new ObjectId(id) });
};

/**
 * OAuth 연결을 해제합니다.
 *
 * @param id - 사용자의 UID
 * @param provider - 해제할 OAuth 제공자
 */
export const unlinkProfile = async (
	id: string,
	provider: string,
): Promise<boolean> => {
	try {
		const userResult = await users.updateOne(
			{ _id: new ObjectId(id) },
			{
				$unset: {
					[provider]: "",
				},
			},
		);

		const accountResult = await accounts.deleteOne({
			userId: new ObjectId(id),
			provider,
		});

		// Check if both operations were acknowledged and at least one document was modified/deleted
		if (userResult.modifiedCount > 0 && accountResult.deletedCount > 0) {
			return true;
		}
		return false;
	} catch (error) {
		// Handle any errors that occurred during the operations
		console.error(error);
		return false;
	}
};

/**
 * 사용자의 프로필을 연결합니다.
 *
 * @param id - 사용자의 UID
 * @param provider - 연결할 OAuth 제공자
 * @param profile - OAuth 프로필
 */
export const linkProfile = async (
	id: string | undefined,
	provider: string | null,
	profile: GoogleProfile | TwitterProfile | null,
) => {
	if (!provider || !profile) return;
	const updateData = (() => {
		switch (provider) {
			case "google":
				if ("sub" in profile) {
					return {
						google: {
							id: profile.sub,
							name: profile.name,
							picture: profile.picture,
							addedAt: new Date(),
						},
					};
				}
				break;
			case "twitter":
				if ("data" in profile) {
					return {
						twitter: {
							id: profile.data.id,
							name: profile.data.name,
							username: profile.data.username,
							picture: profile.data.profile_image_url,
							addedAt: new Date(),
						},
					};
				}
				break;
		}
		return null;
	})();

	if (updateData) {
		await users.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData },
			{ upsert: true },
		);
	}
};

interface GoogleProfile {
	sub: string;
	name: string;
	picture: string;
}

interface TwitterProfile {
	data: {
		id: string;
		name: string;
		username: string;
		profile_image_url: string;
	};
}

/**
 * 사용자의 계정을 삭제합니다.
 *
 * @param id - 사용자 UID
 * @returns 삭제 성공 여부
 */
export const deleteAccount = async (id: string): Promise<boolean> => {
	try {
		const userResult = await users.deleteOne({ _id: new ObjectId(id) });

		const accountResult = await accounts.deleteMany({
			userId: new ObjectId(id),
		});

		// Check if both operations were acknowledged and at least one document was modified/deleted
		if (userResult.deletedCount >= 0 && accountResult.deletedCount >= 0) {
			return true;
		}
		return false;
	} catch (error) {
		// Handle any errors that occurred during the operations
		console.error(error);
		return false;
	}
};

export async function handleSignIn(provider: string): Promise<void> {
	return new Promise((resolve, reject) => {
		signIn(provider).then(resolve).catch(reject);
	});
}

export async function handleSignOut(): Promise<void> {
	return new Promise((resolve, reject) => {
		signOut({ redirectTo: "/" }).then(resolve).catch(reject);
	});
}
