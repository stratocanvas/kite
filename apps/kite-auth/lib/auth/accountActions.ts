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
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { nanoid } from "nanoid";
import { auth } from '@/lib/auth/auth'

const docClient = DynamoDBDocumentClient.from(client);
const sqsClient = new SQSClient({
	region: "ap-northeast-2", // 예: "us-west-2"
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY || "",
		secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || "",
	},
});

/**
 * 사용자의 계정을 초기화합니다.
 * @param id - 사용자 UID
 * @returns 로그인용 계정 정보
 */

export const initializeUser = async (id: string) => {
	const email = nanoid(10);
	const params = {
		TableName: "next-auth",
		Key: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
		},
		UpdateExpression:
			"SET #role = :role, createdAt = :createdAt, email = :email",
		ExpressionAttributeNames: {
			"#role": "role",
		},
		ExpressionAttributeValues: {
			":role": "user",
			":createdAt": new Date().toISOString(),
			":email": email,
		},
	};

	try {
		const command = new UpdateCommand(params);
		await docClient.send(command);

		// 사용자 초기화 후 메시지 암호화 및 전송
		const encryptedMessage = await encryptMessage(id, "create");
		await sendSQSMessage(encryptedMessage);
		return { success: true, message: "User initialized and message sent" };
	} catch (error) {
		console.error("Error initializing user in DynamoDB:", error);
		throw error;
	}
};

interface UpdateMessageBody {
	nickname?: string,
	username?: string,
	image?: string
}

const encryptMessage = async (
	userId: string,
	action: "create" | "delete" | "update",
	body?: UpdateMessageBody
): Promise<string> => {
	const payload = JSON.stringify({ userId, action, body });
	const encodedPayload = new TextEncoder().encode(payload);

	const hexToUint8Array = (hexString: string): Uint8Array => {
		const matches = hexString.match(/.{1,2}/g);
		if (matches === null) {
			throw new Error("Invalid hexadecimal string");
		}
		return new Uint8Array(matches.map((byte) => Number.parseInt(byte, 16)));
	};

	const uint8ArrayToBase64 = (array: Uint8Array): string => {
		return btoa(String.fromCharCode.apply(null, Array.from(array)));
	};

	// 암호화 키를 Uint8Array로 변환
	const keyData = hexToUint8Array(process.env.ENCRYPTION_KEY || "");

	// 암호화 키 생성
	const key = await crypto.subtle.importKey(
		"raw",
		keyData,
		{ name: "AES-GCM" },
		false,
		["encrypt"],
	);

	// IV 생성
	const iv = crypto.getRandomValues(new Uint8Array(12));

	// 암호화
	const encryptedData = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv },
		key,
		encodedPayload,
	);

	return JSON.stringify({
		iv: uint8ArrayToBase64(iv),
		encryptedData: uint8ArrayToBase64(new Uint8Array(encryptedData)),
	});
};

const sendSQSMessage = async (messageBody: string) => {
	const command = new SendMessageCommand({
		QueueUrl: process.env.SQS_QUEUE_URL,
		MessageBody: messageBody,
	});

	try {
		await sqsClient.send(command);
	} catch (error) {
		console.error("Error sending message to SQS:", error);
		throw error;
	}
};

/**
 * OAuth 연결을 해제합니다.
 *
 * @param provider - 해제할 OAuth 제공자
 */
export const unlinkProfile = async (
	provider: string,
): Promise<boolean> => {
	const session = await auth()
	const transactItems = [
		{
			Update: {
				TableName: "next-auth",
				Key: {
					pk: `USER#${session?.user.id}`,
					sk: `USER#${session?.user.id}`,
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
					pk: `USER#${session?.user.id}`,
					sk: `ACCOUNT#${provider}#${session?.user[provider].id}`,
				},
			},
		},
	];

	const transactParams = {
		TransactItems: transactItems,
	};

	try {
		await docClient.send(new TransactWriteCommand(transactParams));
		return true;
	} catch (error) {
		console.error("Error unlinking profile in DynamoDB:", error);
		return false;
	}
};

/**
 * 사용자의 프로필을 연결합니다.
 *
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
 * @returns 삭제 성공 여부
 */

export const deleteAccount = async (): Promise<boolean> => {
	const session = await auth()
	const tableName = "next-auth";
	const pk = `USER#${session?.user.id}`;

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
			console.error(`No items found for account ${session?.user.id}. This is unexpected.`);
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
		const encryptedMessage = await encryptMessage(session?.user.id, "delete");
		await sendSQSMessage(encryptedMessage);
		console.log(encryptedMessage);
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

export const editProfile = async (
	name: string,
	email: string
): Promise<boolean> => {
	const session = await auth()
	const sanitizedName = sanitizeInput(name, 50);
	const sanitizedEmail = sanitizeInput(email, 320).toLowerCase();

	const params = {
		TableName: "next-auth", // DynamoDB 테이블 이름
		Key: {
			pk: `USER#${session?.user.id}`,
			sk: `USER#${session?.user.id}`,
		},
		UpdateExpression: "SET #name = :name, email = :email, GSI1PK = :GSI1PK, GSI1SK = :GSI1SK",
		ExpressionAttributeNames: {
			"#name": "name",
		},
		ExpressionAttributeValues: {
			":name": sanitizedName,
			":email": sanitizedEmail,
			":GSI1PK": `USER#${sanitizedEmail}`,
			":GSI1SK": `USER#${sanitizedEmail}`,
		},
	};
	
	const messageBody = {
		nickname: sanitizedName,
		username: sanitizedEmail
	}

	try {
		await docClient.send(new UpdateCommand(params));
		const encryptedMessage = await encryptMessage(session?.user.id, "update", messageBody);
		await sendSQSMessage(encryptedMessage);
		return true;
	} catch (error) {
		console.error("Error updating DynamoDB:", error);
		throw error;
	}
};

function sanitizeInput(input: string, maxLength: number): string {
	return input
		.trim()
		.slice(0, maxLength)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}