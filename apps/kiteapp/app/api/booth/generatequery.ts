import { ObjectId } from "mongodb";

interface BaseInfo {
	_id: string;
	name: string;
}

interface InputItem {
	id?: string;
	chainMode?: boolean;
	character?: BaseInfo;
	category?: BaseInfo;
	artist?: BaseInfo;
	exhibition?: BaseInfo;
	date?: number;
	buy?: { [key: number]: string };
	[key: string]: any;
}

function generateAtlasSearchQuery(input: InputItem[]): object[] {
	const should: object[] = [];
	const filters: object[] = [];

	let dateFilter: number | undefined;
	let buyFilter: { [key: number]: string } | undefined;

	// biome-ignore lint/complexity/noForEach: <explanation>
	input.forEach((item) => {
		const must: object[] = [];

		const hasCategory = "category" in item && item.category;
		const hasCharacter = "character" in item && item.character;
		const hasBuy = item.buy && Object.keys(item.buy).length > 0;
		const hasDate = item.date && item.date !== 0;

		if (hasBuy) {
			const buyValues = item.buy ? Object.values(item.buy) : [];
			filters.push({
				in: {
					path: "buy.type",
					value: buyValues,
				},
			});
		}
		if (hasDate) {
			filters.push({
				in: {
					path: "date.dow",
					value: item.date,
				},
			});
		}
//TODO: Atlas Search 인덱스에 status 추가
		filters.push({
			text: {
				path: "status",
				query: "open",
			},
		});

		if (hasCategory && hasCharacter) {
			must.push({
				embeddedDocument: {
					path: "product",
					operator: {
						compound: {
							must: [
								{
									equals: {
										path: "product.category._id",
										value: new ObjectId(item.category?._id),
									},
								},
								{
									embeddedDocument: {
										path: "product.option",
										operator: {
											equals: {
												path: "product.option.character._id",
												value: new ObjectId(item.character?._id),
											},
										},
									},
								},
							],
						},
					},
				},
			});
		} else {
			if (hasCategory) {
				must.push({
					embeddedDocument: {
						path: "product",
						operator: {
							equals: {
								path: "product.category._id",
								value: new ObjectId(item.category?._id),
							},
						},
					},
				});
			}
			if (hasCharacter) {
				must.push({
					embeddedDocument: {
						path: "product.option",
						operator: {
							equals: {
								path: "product.option.character._id",
								value: new ObjectId(item.character?._id),
							},
						},
					},
				});
			}
		}

		for (const [key, value] of Object.entries(item)) {
			if (
				key !== "id" &&
				key !== "chainMode" &&
				key !== "category" &&
				key !== "character" &&
				key !== "date" &&
				key !== "buy" &&
				typeof value === "object" &&
				value !== null
			) {
				must.push({
					equals: {
						path: `${key}._id`,
						value: new ObjectId(value._id),
					},
				});
			}
		}

		if (must.length > 0) {
			should.push({ compound: { must } });
		}

		if (item.date !== undefined) {
			dateFilter = item.date;
		}
	});

	const result: object[] = [];

	// 쿼리가 있는 경우에만 $search 스테이지를 추가
	if (should.length > 0 || filters.length > 0) {
		const searchStage: any = {
			$search: {
				index: "booth",
				compound: {},
			},
		};

		if (should.length > 0) {
			searchStage.$search.compound.should = should;
			searchStage.$search.compound.minimumShouldMatch = 1;
		}
		if (filters.length > 0) {
			searchStage.$search.compound.filter = filters;
		}

		result.push(searchStage);
	}

	result.push(
		{
			$limit: 10,
		},
		{
			$project: {
				_id: 1,
				name: 1,
				location: 1,
				artist: 1,
				exhibition: 1,
				date: 1,
				buy: 1,
				genre: 1,
				thumbnail: 1,
				paginationToken: { $meta: "searchSequenceToken" },
			},
		},
	);

	return result;
}

export default generateAtlasSearchQuery;
