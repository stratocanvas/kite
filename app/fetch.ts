import { createClient } from "@/utils/supabase/server";

const supabase = createClient();

export async function fetchOptionsFromSupabase() {
	const { data, error } = await supabase
		.from("character") // Adjust this to your specific table
		.select("character_id, name, thumbnail"); // Adjust the select clause based on your table structure

	if (error) {
		console.error("error", error);
		return [];
	} else {
		return data;
	}
}
