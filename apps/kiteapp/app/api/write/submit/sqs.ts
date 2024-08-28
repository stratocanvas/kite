"use server";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
	region: "ap-northeast-2", // 예: "us-west-2"
	credentials: {
		accessKeyId: process.env.SQS_ACCESS_KEY || "",
		secretAccessKey: process.env.SQS_ACCESS_KEY_SECRET || "",
	},
});

export async function sendMessageToSQS(message: string) {
	try {
		const params = {
			QueueUrl: process.env.SQS_QUEUE_URL,
			MessageBody: message,
		};

		const command = new SendMessageCommand(params);
		const response = await sqsClient.send(command);

		console.log(
			"메시지가 성공적으로 SQS에 전송되었습니다:",
			response.MessageId,
		);
		return { success: true, messageId: response.MessageId };
	} catch (error) {
		console.error("SQS 메시지 전송 중 오류 발생:", error);
		return { success: false, error: error };
	}
}
