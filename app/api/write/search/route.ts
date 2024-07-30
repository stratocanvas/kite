import { connectDB } from "@/utils/mongodb/database";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const client = await connectDB;
	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("query");
	const type = searchParams.get("type");
	try {
		await client.connect();
		const database = client.db("kiteapp");
		const collection = database.collection("tag");
		const searchQuery = [];

		if (query !== "") {
			searchQuery.push({
				$search: {
					index: "tag",
					compound: {
						should: [
							{
								autocomplete: {
									query: query,
									path: "name",
								},
							},
							{
								autocomplete: {
									query: query,
									path: "alias",
								},
							},
						],
					},
				},
			});
		}

		searchQuery.push({
			$match: { type: type },
		});
		const results = await collection.aggregate(searchQuery).limit(10).toArray();
		return NextResponse.json(results);
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	} finally {
		await client.close();
	}
}
