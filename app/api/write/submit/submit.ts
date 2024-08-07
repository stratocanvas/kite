"use server";
import { connectDB } from "@/utils/mongodb/database";
import { ObjectId } from "mongodb";
import { z } from "zod";
import DOMPurify from "dompurify";
import type { Node } from "@tiptap/core";
import { JSDOM } from "jsdom";

const subFormSchema = z.object({
	name: z.string().min(1),
	alias: z.array(z.string()).optional(),
	sns: z.object({ x: z.string().optional(), }).optional(),
	genre: z.object({ _id: z.string(), name: z.string() }).optional(),
	type: z.enum(["exhibition", "artist", "genre", "character", "category"]),
	thumbnail: z.string().url().optional(),
});

const contentSchema: z.ZodType<unknown> = z.lazy(() =>
	z
		.object({
			type: z.string(),
			attrs: z.record(z.any()).optional(),
			content: z.array(contentSchema).optional(),
			text: z.string().optional(),
			marks: z.array(z.object({ type: z.string().optional() })).optional(),
		})
		.optional(),
);

const mainFormSchema = z.object({
	//기본 정보
	exhibition: z.object({
		_id: z.string(),
		name: z.string(),
	}),
	name: z.string().min(1, "부스 이름을 입력해주세요"),
	date: z.array(z.number()).min(1, "참가 날짜를 선택해주세요"),
	location: z.array(z.string()).optional(),
	artist: z
		.array(
			z.object({
				_id: z.string(),
				name: z.string(),
				thumbnail: z.string().optional(),
			}),
		)
		.optional(),

	//인포
	thumbnail: z.instanceof(File).optional(),
	description: z
		.object({
			type: z.string().optional(),
			content: z.array(contentSchema).optional(),
			/*
			.refine((content) => content.some((item) => item?.type === "image"), {
				message: "인포 이미지를 올려주세요",
			}),
			*/
		})
		.optional(),
	//굿즈
	product: z
		.array(
			z.object({
				_id: z.string(),
				name: z.string().min(1, "굿즈 이름을 입력해주세요"),
				category: z.array(
					z.object({
						_id: z.string(),
						name: z.string(),
					}),
				),
				artist: z.array(
					z.object({
						_id: z.string(),
						name: z.string(),
					}),
				),
				option: z.array(
					z.object({
						_id: z.string(),
						image: z.instanceof(File).optional(),
						name: z.string().min(1, "굿즈 이름을 입력해주세요"),
						price: z.number().min(0, "가격을 입력해주세요"),
						character: z
							.array(
								z.object({
									_id: z.string(),
									name: z.string(),
								}),
							)
							.optional(),
						stock: z.number().optional(),
						type: z.enum(["new", "rerun"]).optional(),
					}),
				),
			}),
		)
		.optional(),

	//추가 정보
	genre: z
		.array(
			z.object({
				_id: z.string(),
				name: z.string(),
			}),
		)
		.optional(),
	buy: z
		.array(
			z.object({
				type: z.enum(["survey", "preorder", "ship"]),
				name: z.string().min(1, "제목을 입력해주세요"),
				url: z
					.string()
					.url({ message: "https://로 시작하는 링크를 입력해주세요" }),
				date: z.array(z.date()).min(2).max(2),
			}),
		)
		.optional(),
	promotion: z.array(
		z.object({
			type: z.enum(["quantity", "allOption", "totalPrice"]),
			ifThis: z.object({
				item: z
					.object({
						_id: z.string(),
						name: z.string(),
					})
					.optional(),
				amount: z.number().optional(),
			}),
			thenThat: z.object({
				type: z.enum(["discount", "giveaway"]),
				item: z
					.object({
						product: z.object({
							_id: z.string(),
							name: z.string(),
							option: z.object({
								_id: z.string(),
								name: z.string(),
							}),
						}),
					})
					.optional(),
				amount: z.number(),
			}),
		}),
	),

	//운영
	pos: z.object({
		enabled: z.boolean(),
		displayLevel: z.enum(["secret", "approx", "exact"]).optional(),
	}),
	deposit: z
		.object({
			enabled: z.boolean(),
		})
		.and(
			z.discriminatedUnion("enabled", [
				z.object({
					enabled: z.literal(true),
					account: z.object({
						number: z.number(),
						bank: z.object({
							_id: z.string(),
							name: z.string(),
						}),
						holder: z.string(),
					}),
				}),
				z.object({
					enabled: z.literal(false),
					account: z
						.object({
							number: z.number().optional(),
							bank: z
								.object({
									_id: z.string().optional(),
									name: z.string().optional(),
								})
								.optional(),
							holder: z.string().optional(),
						})
						.optional(),
				}),
			]),
		),
	notice: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
				priority: z.enum(["normal", "high", "urgent"]),
			}),
		)
		.optional(),
});

const schemaMap = {
	main: mainFormSchema,
	sub: subFormSchema,
	// 다른 타입들...
};

type FormData = Record<string, unknown>;

async function ValidateForm(
	data: FormData,
	type: keyof typeof schemaMap,
): Promise<boolean> {
	const schema = schemaMap[type];
	if (!schema) {
		throw new Error(`Invalid form type: ${type}`);
	}
	const result = schema.safeParse(data);
	console.log(result.success);

	return result.success;
}

function convertIdsToObjectId(obj: any): any {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(convertIdsToObjectId);
	}

	const result: any = {};
	for (const [key, value] of Object.entries(obj)) {
		if (key === "_id" && typeof value === "string") {
			result[key] = new ObjectId(value);
		} else {
			result[key] = convertIdsToObjectId(value);
		}
	}

	return result;
}

export async function SubmitSubForm(data: FormData, type: string) {
	// Validate data and type
	const isValid = await ValidateForm(data, type as keyof typeof schemaMap);
	if (!isValid) {
		throw new Error("입력한 내용을 확인해주세요");
	}

	const client = await connectDB;
	try {
		await client.connect();
		const db = client.db("kiteapp");

		// Convert genre._id to ObjectId
		const convertedData = convertIdsToObjectId(data);

		const submit = await db.collection("tag").insertOne(convertedData);
		const insertedData = await db
			.collection("tag")
			.findOne({ _id: submit.insertedId });

		// Convert _id to string
		if (insertedData?._id) {
			insertedData._id = insertedData._id.toString();
		}

		// Convert genre._id to string
		if (insertedData?.genre?._id) {
			insertedData.genre._id = insertedData.genre._id.toString();
		}

		console.log(insertedData);
		return insertedData;
	} finally {
		await client.close();
	}
}
