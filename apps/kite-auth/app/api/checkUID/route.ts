import {
	DynamoDBDocumentClient,
	QueryCommand,
	type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import client from "@/lib/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export async function GET(req: NextRequest) {
	const query = req.nextUrl.searchParams.get("query")?.toLowerCase();
	// Validate username
	if (!query || query.trim() === "") {
		return NextResponse.json({
			available: false,
			cause: "Username is required.",
		});
	}

	if (query.length < 4) {
		return NextResponse.json({
			available: false,
			cause: "아이디는 4자 이상이어야 합니다.",
		});
	}

	if (query.length > 15) {
		return NextResponse.json({
			available: false,
			cause: "아이디는 15자 이하여야 합니다.",
		});
	}

	const validCharRegex = /^[a-z0-9_]+$/;
	if (!validCharRegex.test(query)) {
		return NextResponse.json({
			available: false,
			cause:
				"아이디는 공백 없이 알파벳, 숫자, 밑줄(_)만 사용할 수 있습니다.",
		});
	}

	const docClient = DynamoDBDocumentClient.from(client);
	const params: QueryCommandInput = {
		TableName: "next-auth",
		IndexName: "GSI1", // GSI 이름
		KeyConditionExpression: "GSI1PK = :pkValue",
		ExpressionAttributeValues: {
			":pkValue": `USER#${query}`,
		},
	};
	try {
		const { Items } = await docClient.send(new QueryCommand(params));
		if (Items && Items.length > 0) {
			return NextResponse.json({
				available: false,
				cause: "이미 사용중인 아이디입니다.",
			});
		}
		return NextResponse.json({ available: true });
	} catch (error) {
		console.error("Error checking username in DynamoDB:", error);
		throw error;
	}
}
