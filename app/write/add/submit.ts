"use server";
import { createClient } from "@/utils/supabase/server";
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
	genre: number[];
}

interface AuthorData {
	name: string;
	sns_x: string;
}

interface CategoryData {
	name: string;
}

const supabase = createClient();
export async function RegisterAuthor(values: AuthorData) {
	console.log(values);
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

export async function RegisterCategory(values: CategoryData) {
	console.log(values);

	const { data, error } = await supabase
		.from("category")
		.insert({ name: values.name })
		.select("category_id, name")
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function SubmitBooth(formData: FormData) {
	const { data: boothData, error: boothError } = await supabase
		.from("booth")
		.insert({
			event_id: formData.event,
			name: formData.name,
			date: formData.dates,
			locations: formData.locations,
			thumbnail: formData.thumbnail ?? null,
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

	if (formData.genre) {
		const genreData = formData.genre.map((genreId) => ({
			booth_id: boothData.booth_id,
			genre_id: genreId,
		}));
		const { error: genreError } = await supabase
			.from("booth_genre")
			.insert(genreData);
		if (genreError) {
			throw genreError;
		}
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
					const { data: optionData, error: optionError } = await supabase
						.from("p_option")
						.insert({
							name: option.name,
							price: option.price,
							product_id: productData.product_id,
							thumbnail: option.thumbnail,
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
	if (formData.preorder) {
		for (const preorder of formData.preorder) {
			const { data: preorderData, error: preorderError } = await supabase
				.from("preorder")
				.insert({
					booth_id: boothData.booth_id,
					title: preorder.title,
					type: preorder.type,
					date: preorder.date,
					url: preorder.url,
					always: false,
				});

			if (preorderError) {
				console.log("Error occurred in preorder insert");
				throw preorderError;
			}
		}
	}
	return boothData;
}
