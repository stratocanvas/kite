"use server";
import { connectDB } from "@/utils/mongodb/database";
import { NextResponse } from "next/server";


export async function GET() {
	const client = await connectDB

	try {
		await client.connect();
		const db = client.db("kiteapp");
		const data = await db
			.collection('exhibition')
			.find({})
			.project({ _id: 1, name: 1, group: 1, date: 1 })
			.toArray();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Failed to fetch', error);
		return NextResponse.json(
			{ error: 'Failed to fetch' },
		);
	} finally {
		await client.close();
	}
}
