"use server";
import { createClient } from "@/utils/supabase/server";

const supabase = createClient();

export async function fetchOptionsFromSupabase() {
	const { data, error } = await supabase
		.from("character") // Adjust this to your specific table
		.select("character_id, name, thumbnail"); // Adjust the select clause based on your table structure

	if (error) {
		console.error("error", error);
		return [];
	}
	return data;
}

export async function GetUser() {
	const supabase = createClient();
	const {
		data: { user },
		error: getUserError,
	} = await supabase.auth.getUser();

	if (getUserError) {
		return null;
	}
	const { data } = await supabase
		.from("users")
		.select("id, name, n_name")
		.eq("id", user?.id)
		.limit(1)
		.single();
	return {
		...data,
		providers: user?.app_metadata?.providers || [],
	};
}

export async function SignOut() {
	const supabase = createClient();
	await supabase.auth.signOut();
}
