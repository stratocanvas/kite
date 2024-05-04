"use server";
import { createClient } from "@/utils/supabase/server";
import Vibrant from "node-vibrant";
import sharp from "sharp";
export const runtime = 'edge';
export default async function SearchResult({
	searchParams,
    page = 1,
    limit = 5,
}: {
	searchParams?: {
		character?: string;
		category?: string;
		genre?: string;
		author?: string;
		page?: number;
	};
}) {
	const supabase = createClient();
	let query = supabase.from("booth_search").select(`
        booth_id,
        character_id,
        category_id,
        genre_id,
        author_id
    `);
	if (searchParams?.character) {
		query = query.in("character_id", searchParams.character.split(","));
	}
	if (searchParams?.category) {
		query = query.in("category_id", searchParams.category.split(","));
	}
	if (searchParams?.genre) {
		query = query.in("genre_id", searchParams.genre.split(","));
	}
	if (searchParams?.author) {
		query = query.in("author_id", searchParams.author.split(","));
	}

	const { data: queryResult, error: queryError } = await query;

	if (queryError || !queryResult) {
		// Handle the error or return an appropriate response
		return { booth: [] };
	}

	const {
		data: booth,
		error: boothError,
		count,
	} = await supabase
		.from("booth")
		.select(
			`
      booth_id,
      name,
      locations,
      author(author_id, name, thumbnail),
      event(name),
      date,
      thumbnail
    `,
			{ count: "exact" },
		)
		.in(
			"booth_id",
			queryResult.map((result) => result.booth_id),
		)
		.order("created_at", { ascending: false })
		.range((page - 1) * limit, page * limit - 1);

	if (boothError || !booth) {
		// Handle the error or return an appropriate response
		return { booth: [] };
	}
	const boothWithColors = await Promise.all(
		booth.map(async (booth) => {
			if (booth.thumbnail) {
				const response = await fetch(booth.thumbnail);
				const arrayBuffer = await response.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				const convertedImage = await sharp(buffer).toFormat("png").toBuffer();
				const palette = await Vibrant.from(convertedImage).getPalette();

				return {
					...booth,
					colors: {
						darkMuted: palette.DarkMuted?.hex,
						vibrant: palette.Vibrant?.hex,
						lightVibrant: palette.LightVibrant?.hex,
						darkVibrant: palette.DarkVibrant?.hex,
						muted: palette.Muted?.hex,
						lightMuted: palette.LightMuted?.hex,
					},
				};
			}
			return {
				...booth,
				colors: {
					darkMuted: "#797979",
					vibrant: "#797979",
					lightVibrant: "#797979",
					darkVibrant: "#797979",
					muted: "#797979",
					lightMuted: "#797979",
				},
			};
		}),
	);
	return {
		booth: boothWithColors,
	};
}
