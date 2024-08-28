import { DynamoDB, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const config: DynamoDBClientConfig = {
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY || "",
		secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || "",
	},
	region: process.env.AWS_REGION,
};

const client = DynamoDBDocument.from(new DynamoDB(config), {
	marshallOptions: {
		convertEmptyValues: true,
		removeUndefinedValues: true,
		convertClassInstanceToMap: true,
	},
});

export default client