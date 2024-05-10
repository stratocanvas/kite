"use server";
import { createClient } from "@/utils/supabase/server";

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
		event?: number;
		dow?: string;
	};
}) {
	const supabase = createClient();
	let query = supabase.from("booth_search_2").select(`
        booth_id,
        character_ids,
        category_ids,
        genre_ids,
        author_ids,
		event_ids,
		day_of_week_array
    `);
	if (searchParams?.character) {
		query = query.overlaps("character_ids", [
			searchParams.character.split(","),
		]);
	}
	if (searchParams?.category) {
		query = query.overlaps("category_ids", searchParams.category.split(","));
	}
	if (searchParams?.genre) {
		query = query.overlaps("genre_ids", searchParams.genre.split(","));
	}
	if (searchParams?.author) {
		query = query.overlaps("author_ids", searchParams.author.split(","));
	}
	if (searchParams?.event) {
		query = query.overlaps("event_ids", [searchParams.event]);
	}
	if (searchParams?.dow) {
		query = query.contains("day_of_week_array", searchParams.dow.split(","));
	}

	const { data: queryResult, error: queryError } = await query;
	if (queryError || !queryResult) {
		// Handle the error or return an appropriate response
		return { booth: [] };
	}
	let {
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
      thumbnail,
	  genre(name),
	  preorder(type,date)
    `,
			{ count: "exact" },
		)
		.in(
			"booth_id",
			queryResult.map((result) => result.booth_id),
		)
		.order("created_at", { ascending: false })
		.range((page - 1) * limit, page * limit - 1);
	if (boothError) {
		// Handle the error or return an appropriate response
		return { booth: [] };
	}

	return {
		booth: booth || [],
		count: count || 0,
	};
}
