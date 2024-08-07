import { connectDB } from "@/utils/mongodb/database";
import { ObjectId } from "mongodb";
import { cache } from "react";

const convertIdToString = (item: any): any => {
	if (item instanceof ObjectId) {
		return item.toString();
	}
	if (Array.isArray(item)) {
		return item.map(convertIdToString);
	}
	if (typeof item === "object" && item !== null) {
		if (item instanceof Date) {
			return item;
		}
		return Object.fromEntries(
			Object.entries(item).map(([key, value]) => {
				if (
					key === "date" &&
					Array.isArray(value) &&
					value.length === 2 &&
					value.every((v) => v instanceof Date)
				) {
					return [key, value];
				}
				return [key, convertIdToString(value)];
			}),
		);
	}
	return item;
};

export const GetBooth = cache(async (boothId: string) => {
	const client = await connectDB;

	try {
		await client.connect();
		const db = client.db("kiteapp");
		const data = await db
			.collection("booth")
			.findOne({ _id: new ObjectId(boothId) });

		if (data) {
			const convertedData = convertIdToString(data);
			return convertedData;
		}
		return null;
	} finally {
		await client.close();
	}
});
