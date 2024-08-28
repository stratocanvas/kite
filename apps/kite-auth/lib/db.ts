import { DynamoDB, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

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

export default client