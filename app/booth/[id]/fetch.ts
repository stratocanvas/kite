import { cache } from "react";
import { connectDB } from "@/utils/mongodb/database";
import { ObjectId } from "mongodb";

export const GetBooth = cache(async (boothId: string) => {
	const client = await connectDB;
	await client.connect();
	const db = client.db("kiteapp");
	const data = await db
		.collection("booth")
		.findOne({ _id: new ObjectId(boothId) });
	return data;
});