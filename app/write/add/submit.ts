"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

interface FormData {
	event: number;
	name: string;
	dates: Date[];
	locations: string[];
	authors: number[];
	thumbnail: string;
	boothinfo: any;
	preorder: any;
	products: any;
}

interface AuthorData {
	name: string;
	sns_x: string;
}

const supabase = createClient();
export async function RegisterAuthor(values: AuthorData) {
	// sns_x 맨 앞글자가 '@'로 시작하지 않는 경우 '@' 추가
	if (!values.sns_x.startsWith("@")) {
		values.sns_x = `@${values.sns_x}`;
	}

	const { data, error } = await supabase
		.from("author")
		.insert({ name: values.name, sns_x: values.sns_x })
		.select("author_id, name, sns_x")
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function SubmitBooth(formData: FormData) {
	const uuid = uuidv4();
	//convert image to webp

	let publicUrlData;

	if (formData.thumbnail) {
		const isWebP = formData.thumbnail.startsWith("data:image/webp;base64,");
		let thumbnailBuffer: Buffer;
		if (isWebP) {
			// If the thumbnail is already in WebP format, convert the base64 string to a buffer
			thumbnailBuffer = Buffer.from(formData.thumbnail.split(",")[1], "base64");
		} else {
			// If the thumbnail is not in WebP format, convert it to WebP using sharp
			const base64Data = formData.thumbnail.split(",")[1];
			const imageBuffer = Buffer.from(base64Data, "base64");
			thumbnailBuffer = await sharp(imageBuffer).webp().toBuffer();
		}

		//upload thumbnail
		const { data, error } = await supabase.storage
			.from("booth")
			.upload(`thumbnails/${uuid}.webp`, thumbnailBuffer, {
				contentType: "image/webp",
			});
		if (error) {
			throw error;
		}
		publicUrlData = await supabase.storage
			.from("booth")
			.getPublicUrl(data.path);
	}

	if (formData.boothinfo?.content) {
		for (const item of formData.boothinfo.content) {
			if (item.type === "image") {
				const isItemWebP = item.attrs?.src?.startsWith(
					"data:image/webp;base64,",
				);
				let itemBuffer: Buffer;

				if (isItemWebP) {
					itemBuffer = Buffer.from(
						item.attrs?.src?.split(",")[1] ?? "",
						"base64",
					);
				} else {
					const base64Data = item.attrs?.src?.split(",")[1] ?? "";
					const imageBuffer = Buffer.from(base64Data, "base64");
					itemBuffer = await sharp(imageBuffer).webp().toBuffer();
				}

				const itemUuid = uuidv4();
				const { data, error } = await supabase.storage
					.from("booth")
					.upload(`article/${itemUuid}.webp`, itemBuffer, {
						contentType: "image/webp",
					});
				if (error) {
					throw error;
				}
				const { data: itemPublicUrlData } = await supabase.storage
					.from("booth")
					.getPublicUrl(data.path);

				item.attrs = {
					...item.attrs,
					src: itemPublicUrlData.publicUrl,
				};
			}
		}
	}

	const { data: boothData, error: boothError } = await supabase
		.from("booth")
		.insert({
			event_id: formData.event,
			name: formData.name,
			date: formData.dates,
			locations: formData.locations,
			thumbnail: publicUrlData?.data.publicUrl ?? null,
			article: JSON.stringify(formData.boothinfo),
		})
		.select("booth_id")
		.single();

	if (boothError) {
		throw boothError;
	}
	const authorIds = formData.authors;
	const boothAuthorData = authorIds.map((authorId) => ({
		booth_id: boothData.booth_id,
		author_id: authorId,
	}));

	const { error: boothAuthorError } = await supabase
		.from("booth_author")
		.insert(boothAuthorData);

	if (boothAuthorError) {
		throw boothAuthorError;
	}

	if (formData.products) {
		for (const product of formData.products) {
			const { data: productData, error: productError } = await supabase
				.from("product")
				.insert({
					name: product.name,
					adult: false,
					booth_id: boothData.booth_id,
				})
				.select("product_id")
				.single();

			if (productError) {
				console.log("error occured in product insert");
				throw productError;
			}

			if (product.authors) {
				const productAuthorData = product.authors.map((authorId: number) => ({
					product_id: productData.product_id,
					authors_id: authorId,
				}));

				const { error: productAuthorError } = await supabase
					.from("product_authors")
					.insert(productAuthorData);

				if (productAuthorError) {
					console.log("error occured in product author insert");
					throw productAuthorError;
				}
			}

			if (product.category) {
				const { error: productCategoryError } = await supabase
					.from("product_category")
					.insert({
						product_id: productData.product_id,
						category_id: product.category,
					});

				if (productCategoryError) {
					console.log("error occured in product category insert");
					throw productCategoryError;
				}
			}

			if (product.options) {
				for (const option of product.options) {
					let thumbnailUrl = null;
					if (option.thumbnail) {
						const isOptionWebP = option.thumbnail.startsWith(
							"data:image/webp;base64,",
						);
						let optionThumbnailBuffer: Buffer;

						if (isOptionWebP) {
							optionThumbnailBuffer = Buffer.from(
								option.thumbnail.split(",")[1],
								"base64",
							);
						} else {
							const base64Data = option.thumbnail.split(",")[1];
							const imageBuffer = Buffer.from(base64Data, "base64");
							optionThumbnailBuffer = await sharp(imageBuffer)
								.webp()
								.toBuffer();
						}

						const optionUuid = uuidv4();
						const { data, error } = await supabase.storage
							.from("product")
							.upload(`option/${optionUuid}.webp`, optionThumbnailBuffer, {
								contentType: "image/webp",
							});
						if (error) {
							console.log("error occured in product option thumbnail insert");
							throw error;
						}
						const { data: thumbnailData } = await supabase.storage
							.from("product")
							.getPublicUrl(data.path);
						thumbnailUrl = thumbnailData.publicUrl;
					}

					const { data: optionData, error: optionError } = await supabase
						.from("p_option")
						.insert({
							name: option.name,
							price: option.price,
							product_id: productData.product_id,
							thumbnail: thumbnailUrl,
						})
						.select("option_id")
						.single();

					if (optionError) {
						console.log("error occured in product option insert");
						throw optionError;
					}

					if (option.character) {
						const { error: optionCharacterError } = await supabase
							.from("option_character")
							.insert({
								option_id: optionData.option_id,
								character_id: option.character,
							});

						if (optionCharacterError) {
							console.log("error occured in product option character insert");
							throw optionCharacterError;
						}
					}
				}
			}
		}
	}
	return boothData;
	
}
