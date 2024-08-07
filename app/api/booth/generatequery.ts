import { da } from "date-fns/locale";
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
	console.log(input);
	const should: object[] = [];
    const filters: object[] = [];

	let dateFilter: number | undefined;
	let buyFilter: { [key: number]: string } | undefined;

	// biome-ignore lint/complexity/noForEach: <explanation>
	input.forEach((item) => {
		const must: object[] = [];

		const hasCategory = "category" in item && item.category;
		const hasCharacter = "character" in item && item.character;

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

		// Update date and buy filters
		if (item.date !== undefined) {
			dateFilter = item.date;
		}
		if (item.buy !== undefined) {
			buyFilter = item.buy;
		}
	});

	const result: object[] = [];

	// Only add $search stage if there are any search conditions
	if (should.length > 0) {
		result.push({
			$search: {
				index: "booth",
				compound: {
					should,
					minimumShouldMatch: 1,
				},
			},
		});
	}

	if (dateFilter !== undefined && dateFilter !== 0) {
		result.push({
			$match: {
				$expr: {
					$anyElementTrue: {
						$map: {
							input: "$date",
							as: "date",
							in: { $eq: [{ $dayOfWeek: "$$date" }, dateFilter] },
						},
					},
				},
			},
		});
	}
	if (buyFilter && Object.keys(buyFilter).length > 0) {
		const buyValues = Object.values(buyFilter);
		result.push({
			$match: {
				"buy.type": { $in: buyValues },
			},
		});
	}

	console.log(JSON.stringify(result, null, 2));
	return result;
}

export default generateAtlasSearchQuery;
