import clientPromise from "@/utils/mongodb/database";
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
	name: string;
	// Add other fields as needed
}

export const GetBoothList = cache(
	async (searchParams: URLSearchParams): Promise<BoothDocument[] | null> => {
		let client: MongoClient | null = null;
		try {
			const connectStart = Date.now();
			client = await clientPromise;
			const connectEnd = Date.now();
			const database = client.db("kiteapp");
			const collection: Collection<BoothDocument> =
				database.collection("booth");
			const queryInput = searchParams.get("q");
			const parsedInput = parseQueryInput(queryInput || "");

			let result: BoothDocument[];

			if (isEmptyOrSpecificCase(parsedInput)) {
				const emptyStart = Date.now();
				result = await collection
					.find({})
					.project({
						_id: 1,
						name: 1,
						location: 1,
						artist: 1,
						exhibition: 1,
						date: 1,
						buy: 1,
						genre: 1,
						thumbnail: 1,
					})
					.limit(10)
					.toArray();
				const emptyEnd = Date.now();
				console.log("Empty query time:", emptyEnd - emptyStart);
			} else {
				const generateQueryStart = Date.now();
				const searchQuery = generateAtlasSearchQuery(parsedInput);
				const generateQueryEnd = Date.now();
				const queryStart = Date.now();
				result = await collection
					.aggregate<BoothDocument>(searchQuery)
					.toArray();
				const queryEnd = Date.now();
				console.log(
					"Generate query time:",
					generateQueryEnd - generateQueryStart,
				);
				console.log("Query time:", queryEnd - queryStart);
			}

			console.log("Connect time:", connectEnd - connectStart);

			return result;
		} catch (error) {
			console.error("Error in GetBoothList:", error);
			return null;
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

function isEmptyOrSpecificCase(input: InputItem[]): boolean {
	if (input.length === 0) return true;
	if (input.length === 1 && "date" in input[0] && "buy" in input[0]) {
		return (
			Object.keys(input[0]).length === 2 &&
			input[0].date === 0 &&
			Object.keys(input[0].buy).length === 0
		);
	}
	return false;
}
