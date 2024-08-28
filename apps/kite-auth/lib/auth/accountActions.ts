"use server";
import { signIn, signOut } from "./auth";
import client from "@/lib/db";
import {
	BatchWriteCommand,
	type BatchWriteCommandInput,
	DynamoDBDocumentClient,
	QueryCommand,
	type QueryCommandInput,
	TransactWriteCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const docClient = DynamoDBDocumentClient.from(client);
import { revalidatePath } from "next/cache";

/**
 * 사용자의 계정을 초기화합니다.
 * @param id - 사용자 UID
 * @returns 로그인용 계정 정보
 */

export const initializeUser = async (id: string) => {
	const params = {
		TableName: "next-auth",
		Key: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
		},
		UpdateExpression: "SET #role = :role, createdAt = :createdAt",
		ExpressionAttributeNames: {
			"#role": "role",
		},
		ExpressionAttributeValues: {
			":role": "user",
			":createdAt": new Date().toISOString(),
		},
	};

	try {
		const command = new UpdateCommand(params);
		return await docClient.send(command);
	} catch (error) {
		console.error("Error initializing user in DynamoDB:", error);
		throw error;
	}
};

/**
 * OAuth 연결을 해제합니다.
 *
 * @param id - 사용자의 UID
 * @param provider - 해제할 OAuth 제공자
 * @param providerId - 해제할 OAuth 제공자의 id
 */
export const unlinkProfile = async (
	id: string,
	provider: string,
	providerId: string,
): Promise<boolean> => {
	const transactItems = [
		{
			Update: {
				TableName: "next-auth",
				Key: {
					pk: `USER#${id}`,
					sk: `USER#${id}`,
				},
				UpdateExpression: "REMOVE #provider",
				ExpressionAttributeNames: {
					"#provider": provider,
				},
			},
		},
		{
			Delete: {
				TableName: "next-auth",
				Key: {
					pk: `USER#${id}`,
					sk: `ACCOUNT#${provider}#${providerId}`,
				},
			},
		},
	];

	const transactParams = {
		TransactItems: transactItems,
	};

	try {
		await docClient.send(new TransactWriteCommand(transactParams));
		revalidatePath("/dashboard");
		return true;
	} catch (error) {
		console.error("Error unlinking profile in DynamoDB:", error);
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
	if (!id || !provider || !profile) return;

	const updateData = (() => {
		switch (provider) {
			case "google":
				if ("sub" in profile) {
					return {
						id: profile.sub,
						name: profile.name,
						picture: profile.picture,
						addedAt: new Date().toISOString(),
					};
				}
				break;
			case "twitter":
				if ("data" in profile) {
					return {
						id: profile.data.id,
						name: profile.data.name,
						username: profile.data.username,
						picture: profile.data.profile_image_url,
						addedAt: new Date().toISOString(),
					};
				}
				break;
		}
		return null;
	})();

	if (updateData) {
		const params = {
			TableName: "next-auth", // DynamoDB 테이블 이름
			Key: {
				pk: `USER#${id}`,
				sk: `USER#${id}`,
			},
			UpdateExpression: "SET #provider = :profile",
			ExpressionAttributeNames: {
				"#provider": provider,
			},
			ExpressionAttributeValues: {
				":profile": updateData,
			},
		};

		try {
			await docClient.send(new UpdateCommand(params));
		} catch (error) {
			console.error("Error updating DynamoDB:", error);
			throw error;
		}
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
	const tableName = "next-auth";
	const pk = `USER#${id}`;

	try {
		// 1. Query items with the same partition key
		const queryParams: QueryCommandInput = {
			TableName: tableName,
			KeyConditionExpression: "pk = :pkValue",
			ExpressionAttributeValues: {
				":pkValue": pk,
			},
		};

		const { Items } = await docClient.send(new QueryCommand(queryParams));

		if (!Items || Items.length === 0) {
			console.error(`No items found for account ${id}. This is unexpected.`);
			return false;
		}

		const deleteRequests = Items.map((item) => ({
			DeleteRequest: {
				Key: {
					pk: item.pk,
					sk: item.sk,
				},
			},
		}));

		const batchWriteParams: BatchWriteCommandInput = {
			RequestItems: {
				[tableName]: deleteRequests,
			},
		};

		await docClient.send(new BatchWriteCommand(batchWriteParams));
		return true;
	} catch (error) {
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
