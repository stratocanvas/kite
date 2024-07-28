"use server";
import { connectDB } from "@/utils/mongodb/database";
import { NextResponse } from "next/server";

// Collection 목록
const collections = {
	exhibition: "exhibition",
	author: "author",
	character: "character",
	category: "category",
	genre: "genre",
};

// Collection별 불러올 데이터 목록
const projections = {
	exhibition: { _id: 1, name: 1, group: 1, date: 1 },
	artist: { _id: 1, name: 1, thumbnail: 1, sns_x: 1 },
	character: { _id: 1, name: 1, thumbnail: 1, genre: 1 },
	category: { _id: 1, name: 1 },
	genre: { _id: 1, name: 1 },
};

export async function GET({ params }: { params: { type: keyof typeof collections } }) {
	const { type } = params;
	if (!collections[type]) {
		return NextResponse.json({ error: "Invalid data type" }, { status: 400 });
	}
	const client = await connectDB

	try {
		await client.connect();
		const db = client.db("kiteapp");
		const data = await db
			.collection(collections[type as keyof typeof collections])
			.find({})
			.project(projections[type as keyof typeof projections])
			.toArray();
		return NextResponse.json(data);
	} catch (error) {
		console.error(`Failed to fetch ${type}:`, error);
		return NextResponse.json(
			{ error: `Failed to fetch ${type}` },
			{ status: 500 },
		);
	} finally {
		await client.close();
	}
}
