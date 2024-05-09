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
	};
}) {
	const supabase = createClient();
	let query = supabase.from("booth_search").select(`
        booth_id,
        character_id,
        category_id,
        genre_id,
        author_id,
		event_id
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
	if (searchParams?.event) {
		query = query.eq("event_id", searchParams.event);
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
      thumbnail,
	  genre(name),
	  preorder(type,date)
    `,
			{ count: "exact" },
		)
		.in("booth_id", [...new Set(queryResult.map((result) => result.booth_id))])
		.order("created_at", { ascending: false })
		.range((page - 1) * limit, page * limit - 1);
	if (boothError || !booth) {
		// Handle the error or return an appropriate response
		return { booth: [] };
	}
	return {
		booth: booth,
	};
}
