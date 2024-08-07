import { connectDB } from "@/utils/mongodb/database";
import { cache } from "react";
import type { Collection, MongoClient } from "mongodb";

import generateAtlasSearchQuery from "./generatequery";

interface BaseInfo {
	_id: string;
	name: string;
}

interface InputItem {
	id: string;
	chainMode: boolean;
	character?: BaseInfo;
	category?: BaseInfo;
	artist?: BaseInfo;
	exhibition?: BaseInfo;
	genre?: BaseInfo;
	[key: string]: any;
}

interface BoothDocument {
	_id: string;
	// Add other fields as needed
}

export const GetBoothList = cache(
	async (searchParams: URLSearchParams): Promise<BoothDocument[] | null> => {
		let client: MongoClient | null = null;
		try {
			const start = Date.now();

			client = await connectDB;
			await client.connect();
			const database = client.db("kiteapp");
			const collection: Collection<BoothDocument> =
				database.collection("booth");
			const queryInput = searchParams.get("q");

			if (!queryInput) {
				return await collection.find().limit(10).toArray();
			}

			const parsedInput = parseQueryInput(queryInput);
			const searchQuery = generateAtlasSearchQuery(parsedInput);
			const result = await collection
				.aggregate<BoothDocument>(searchQuery)
				.limit(10)
				.toArray();
			const end = Date.now();
			console.log("Search took", end - start, "ms");
			return result;
		} catch (error) {
			console.error("Error in GetBoothList:", error);
			return null;
		} finally {
			if (client) {
				await client.close();
			}
		}
	},
);

function parseQueryInput(queryInput: string): InputItem[] {
	try {
		const decodedInput = decodeURIComponent(queryInput);
		const parsed = JSON.parse(decodedInput);
		return Array.isArray(parsed) ? parsed : [parsed];
	} catch (error) {
		console.error("Error parsing query input:", error);
		return [];
	}
}
