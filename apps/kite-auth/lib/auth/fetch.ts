import client from "@/lib/db";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { cache } from "react";

const docClient = DynamoDBDocumentClient.from(client);

export const getUserData = cache(async (id: string) => {
	console.log("Fetching user:", id);
	const params = {
		TableName: "next-auth",
		Key: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
		},
		ProjectionExpression: "google, twitter",
	};

	try {
		const command = new GetCommand(params);
		const response = await docClient.send(command);
		return response.Item;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
});
