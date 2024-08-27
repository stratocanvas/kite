import clientPromise from "@/lib/database";
import { cache } from "react";
import type { Collection, MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import generateAtlasSearchQuery from "./generatequery";
import { Buffer } from "node:buffer";

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

function parseQueryInput(queryInput: string): InputItem[] {
	try {
		// Base64 디코딩
		const decodedBase64 = atob(queryInput);

		// URL 디코딩
		const decodedInput = decodeURIComponent(decodedBase64);

		// JSON 파싱
		const parsed = JSON.parse(decodedInput);

		return Array.isArray(parsed) ? parsed : [parsed];
	} catch (error) {
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

export const GetBoothList = cache(
	async (query: string): Promise<BoothDocument[] | null> => {
		let client: MongoClient | null = null;
		try {
			client = await clientPromise;
			const database = client.db("kiteapp");
			const collection: Collection<BoothDocument> =
				database.collection("booth");
			const queryInput = query;
			const parsedInput = parseQueryInput(queryInput || "");

			let result: BoothDocument[];

			if (isEmptyOrSpecificCase(parsedInput)) {
				result = await collection
					.find({ status: "open" })
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
			} else {
				const searchQuery = generateAtlasSearchQuery(parsedInput);
				result = await collection
					.aggregate<BoothDocument>(searchQuery)
					.toArray();
			}

			const convertedData = convertIdToString(result);
			return convertedData;
		} catch (error) {
			console.error("Error in GetBoothList:", error);
			return null;
		}
	},
);

export const GetBooth = cache(async (boothId: string) => {
	const client = await clientPromise;

	try {
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
	}
});
