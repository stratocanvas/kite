//이 쿼리는 클라이언트 컴포넌트에서 실행되므로, Tanstack Query를 사용하기 위해 Route Handler를 사용합니다.
import clientPromise from "@/lib/database";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const client = await clientPromise;
	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("query");
	const type = searchParams.get("type");
	try {
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
	}
}
